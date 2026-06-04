<?php
// autoshoopa-backend/api/orders.php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../utils/AuthMiddleware.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/NotificationManager.php';

try {
    $db = getConnection(); // returns MongoDB\Database
    $ordersCollection = getCollection('orders');
    $productsCollection = getCollection('products');
    $usersCollection = getCollection('users');
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed', 'message' => $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$customerId = $_GET['customerId'] ?? null;
$sellerId = $_GET['sellerId'] ?? null;

switch ($method) {
    case 'GET':
        $payload = requireAuth();
        if ($id) {
            try {
                $objId = new MongoDB\BSON\ObjectId($id);
                $order = $ordersCollection->findOne(['_id' => $objId]);
            } catch (Exception $e) {
                $order = $ordersCollection->findOne(['_id' => $id]);
            }

            if ($order) {
                // Populate customer info
                try {
                    $custObjId = new MongoDB\BSON\ObjectId($order['customer_id']);
                    $customer = $usersCollection->findOne(['_id' => $custObjId]);
                } catch (Exception $e) {
                    $customer = $usersCollection->findOne(['_id' => $order['customer_id']]);
                }

                $formatted = formatMongoDoc($order);
                $formatted['customer_name'] = $customer['name'] ?? 'Unknown';
                $formatted['customer_email'] = $customer['email'] ?? '';
                echo json_encode($formatted);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Order not found']);
            }
        } elseif ($customerId) {
            $cursor = $ordersCollection->find(['customer_id' => $customerId], ['sort' => ['created_at' => -1]]);
            $orders = [];
            foreach ($cursor as $doc) {
                $orders[] = formatMongoDoc($doc);
            }
            echo json_encode($orders);
        } elseif ($sellerId) {
            // Find orders containing products of this seller
            $cursor = $ordersCollection->find([], ['sort' => ['created_at' => -1]]);
            $orders = [];
            foreach ($cursor as $doc) {
                $items = $doc['items'] ?? [];
                $sellerItems = [];
                foreach ($items as $item) {
                    // Check if product belongs to this seller
                    $prodId = $item['product_id'];
                    try {
                        $prodObjId = new MongoDB\BSON\ObjectId($prodId);
                        $product = $productsCollection->findOne(['_id' => $prodObjId]);
                    } catch (Exception $e) {
                        $product = $productsCollection->findOne(['_id' => $prodId]);
                    }

                    if ($product && (string)$product['seller_id'] === (string)$sellerId) {
                        $sellerItems[] = $item;
                    }
                }

                if (!empty($sellerItems)) {
                    $formatted = formatMongoDoc($doc);
                    $formatted['items'] = $sellerItems; // filter to only show this seller's items for privacy/relevance
                    $orders[] = $formatted;
                }
            }
            echo json_encode($orders);
        } else {
            // List all orders (admin)
            $cursor = $ordersCollection->find([], ['sort' => ['created_at' => -1]]);
            $orders = [];
            foreach ($cursor as $doc) {
                // Populate customer info
                try {
                    $custObjId = new MongoDB\BSON\ObjectId($doc['customer_id']);
                    $customer = $usersCollection->findOne(['_id' => $custObjId]);
                } catch (Exception $e) {
                    $customer = $usersCollection->findOne(['_id' => $doc['customer_id']]);
                }

                $formatted = formatMongoDoc($doc);
                $formatted['customer_name'] = $customer['name'] ?? 'Unknown';
                $formatted['customer_email'] = $customer['email'] ?? '';
                $orders[] = $formatted;
            }
            echo json_encode($orders);
        }
        break;

    case 'POST':
        $payload = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['items']) || empty($data['items']) || !isset($data['shipping_address'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields (items or shipping_address)']);
            break;
        }

        try {
            $totalAmount = 0;
            $processedItems = [];
            $rolledBackItems = [];

            // Validate and decrement stock
            foreach ($data['items'] as $item) {
                $productId = $item['id'] ?? $item['product_id'];
                $quantity = (int) $item['quantity'];

                try {
                    $prodObjId = new MongoDB\BSON\ObjectId($productId);
                    $query = ['_id' => $prodObjId];
                } catch (Exception $e) {
                    $query = ['_id' => $productId];
                }

                // Fetch product details
                $product = $productsCollection->findOne($query);
                if (!$product) {
                    throw new Exception("Product ID " . $productId . " not found");
                }

                $stock = $product['stock_quantity'] ?? $product['stock'] ?? 0;
                if ($stock < $quantity) {
                    throw new Exception("Insufficient stock for Product: " . $product['name']);
                }

                // Decrement stock atomically
                $updateResult = $productsCollection->updateOne(
                    array_merge($query, ['stock_quantity' => ['$gte' => $quantity]]),
                    ['$inc' => ['stock_quantity' => -$quantity]]
                );

                if ($updateResult->getModifiedCount() === 0) {
                    // Rollback previously decremented products
                    foreach ($rolledBackItems as $rb) {
                        $productsCollection->updateOne($rb['query'], ['$inc' => ['stock_quantity' => $rb['qty']]]);
                    }
                    throw new Exception("Failed to secure stock for Product: " . $product['name']);
                }

                $rolledBackItems[] = ['query' => $query, 'qty' => $quantity];

                $price = (float) $product['price'];
                $totalAmount += $price * $quantity;

                $processedItems[] = [
                    'product_id'   => (string) $productId,
                    'quantity'     => $quantity,
                    'price'        => $price,
                    'name'         => $product['name'],
                    'product_name' => $product['name'],
                    'image_url'    => $product['image_url'] ?? '',
                    'image'        => $product['image_url'] ?? '',
                    'total'        => $price * $quantity
                ];
            }

            // Create shipping address field format
            $shippingAddress = $data['shipping_address'];
            if (is_array($shippingAddress)) {
                $customerInfo = $shippingAddress;
            } else {
                $customerInfo = [
                    'address' => $shippingAddress,
                    'name'    => $payload['name'] ?? 'Customer',
                    'email'   => $payload['email'] ?? ''
                ];
            }

            // Create order document
            $orderDocument = [
                'customer_id'      => (string) $payload['id'],
                'total_amount'     => $totalAmount,
                'status'           => 'pending',
                'payment_method'   => $data['paymentMethod'] ?? 'card',
                'customer_info'    => $customerInfo,
                'shipping_address' => is_array($shippingAddress) ? json_encode($shippingAddress) : $shippingAddress,
                'items'            => $processedItems,
                'created_at'       => new MongoDB\BSON\UTCDateTime()
            ];

            $result = $ordersCollection->insertOne($orderDocument);
            $orderId = $result->getInsertedId();
            $orderIdStr = (string) $orderId;

            $createdOrderDoc = $ordersCollection->findOne(['_id' => $orderId]);
            $formattedOrder = formatMongoDoc($createdOrderDoc);

            // If payment method is Chapa, initialize transaction
            $paymentUrl = null;
            if (isset($data['paymentMethod']) && $data['paymentMethod'] === 'chapa') {
                require_once __DIR__ . '/../utils/Chapa.php';
                
                $txRef = 'tx-' . $orderIdStr;
                $chapaData = [
                    'amount'       => $totalAmount,
                    'currency'     => 'ETB',
                    'email'        => $payload['email'] ?? 'customer@autoshoopa.com',
                    'first_name'   => $customerInfo['name'] ?? ($payload['name'] ?? 'Customer'),
                    'last_name'    => '',
                    'tx_ref'       => $txRef,
                    'callback_url' => 'http://localhost/Autoshoopa_website/autoshoopa-backend/api/verify_payment.php?tx_ref=' . $txRef,
                    'return_url'   => 'http://localhost:3000/checkout?status=success&tx_ref=' . $txRef . '&orderId=' . $orderIdStr,
                    'customization'=> [
                        'title'       => 'AutoShoopa Parts',
                        'description' => 'Payment for order #' . strtoupper(substr($orderIdStr, -8))
                    ]
                ];

                try {
                    $init = Chapa::initializePayment($chapaData);
                    if (isset($init['status']) && $init['status'] === 'success') {
                        $paymentUrl = $init['data']['checkout_url'];
                    } else {
                        throw new Exception($init['message'] ?? 'Failed to initialize Chapa payment');
                    }
                } catch (Exception $chapaEx) {
                    // Rollback stock decrement & delete order
                    $ordersCollection->deleteOne(['_id' => $orderId]);
                    foreach ($rolledBackItems as $rb) {
                        $productsCollection->updateOne($rb['query'], ['$inc' => ['stock_quantity' => $rb['qty']]]);
                    }
                    throw new Exception("Chapa Payment Initialization failed: " . $chapaEx->getMessage());
                }
            }

            // ── Notifications ──────────────────────────────────────────
            try {
                $nm = new NotificationManager($db);
                $customerId = (string) $payload['id'];
                $customerName = $customerInfo['name'] ?? ($payload['name'] ?? 'Customer');

                // Notify customer: order confirmed
                $nm->notifyOrderConfirmed($orderIdStr, $customerId, $totalAmount);

                // Notify each unique seller that they have a new order
                $notifiedSellers = [];
                foreach ($processedItems as $pItem) {
                    try {
                        $pObjId = new MongoDB\BSON\ObjectId($pItem['product_id']);
                        $prod   = $productsCollection->findOne(['_id' => $pObjId]);
                    } catch (Exception $ex) {
                        $prod = $productsCollection->findOne(['_id' => $pItem['product_id']]);
                    }
                    if ($prod && isset($prod['seller_id'])) {
                        $sellerId = (string) $prod['seller_id'];
                        if (!in_array($sellerId, $notifiedSellers)) {
                            $nm->notifyOrderPlaced($orderIdStr, $sellerId, $customerName);
                            $notifiedSellers[] = $sellerId;
                        }
                    }
                }
            } catch (Exception $notifEx) {
                error_log('Notification error: ' . $notifEx->getMessage());
            }
            // ──────────────────────────────────────────────────────────

            http_response_code(201);
            $responsePayload = ['order' => $formattedOrder];
            if ($paymentUrl) {
                $responsePayload['payment_url'] = $paymentUrl;
            }
            echo json_encode($responsePayload);

        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $payload = requireAuth();
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing id']);
            break;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['status'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing status']);
            break;
        }

        try {
            try {
                $objId = new MongoDB\BSON\ObjectId($id);
                $query = ['_id' => $objId];
            } catch (Exception $e) {
                $query = ['_id' => $id];
            }

            $ordersCollection->updateOne($query, ['$set' => ['status' => $data['status']]]);

            // Notify customer of status change
            try {
                $updatedOrder = $ordersCollection->findOne($query);
                if ($updatedOrder && isset($updatedOrder['customer_id'])) {
                    $nm = new NotificationManager($db);
                    $nm->notifyOrderStatus($id, (string) $updatedOrder['customer_id'], $data['status']);
                }
            } catch (Exception $notifEx) {
                error_log('Status notification error: ' . $notifEx->getMessage());
            }

            echo json_encode(['orderId' => $id, 'status' => $data['status']]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update order status', 'message' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
