<?php
// autoshoopa-backend/api/verify_payment.php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../utils/AuthMiddleware.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Chapa.php';
require_once __DIR__ . '/../utils/NotificationManager.php';

try {
    $db = getConnection();
    $ordersCollection = getCollection('orders');
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed', 'message' => $e->getMessage()]);
    exit;
}

$payload = requireAuth();

$txRef = $_GET['tx_ref'] ?? null;
if (!$txRef) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing transaction reference (tx_ref)']);
    exit;
}

try {
    // Call Chapa API to verify payment
    $verification = Chapa::verifyPayment($txRef);
    
    if (isset($verification['status']) && $verification['status'] === 'success') {
        // Parse the order ID from tx_ref
        $orderIdStr = str_replace(['tx-order_', 'tx-'], '', $txRef);
        
        try {
            $objId = new MongoDB\BSON\ObjectId($orderIdStr);
            $query = ['_id' => $objId];
        } catch (Exception $e) {
            $query = ['_id' => $orderIdStr];
        }

        $order = $ordersCollection->findOne($query);
        if (!$order) {
            http_response_code(404);
            echo json_encode(['error' => 'Order not found for transaction reference']);
            exit;
        }

        // If order status is pending, update it to processing
        if ($order['status'] === 'pending') {
            $ordersCollection->updateOne($query, ['$set' => ['status' => 'processing', 'payment_status' => 'paid']]);
            
            // Notify customer of order status change
            try {
                if (isset($order['customer_id'])) {
                    $nm = new NotificationManager($db);
                    $nm->notifyOrderStatus($orderIdStr, (string) $order['customer_id'], 'processing');
                }
            } catch (Exception $notifEx) {
                error_log('Verification status notification error: ' . $notifEx->getMessage());
            }
        }

        // Fetch updated order
        $updatedOrder = $ordersCollection->findOne($query);
        echo json_encode([
            'success' => true,
            'message' => 'Payment verified successfully',
            'order' => formatMongoDoc($updatedOrder)
        ]);
    } else {
        http_response_code(400);
        echo json_encode([
            'error' => 'Payment verification failed',
            'details' => $verification
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'An error occurred during verification',
        'message' => $e->getMessage()
    ]);
}
?>
