<?php
/**
 * NotificationManager - MongoDB implementation
 * Handles creating, fetching, and updating user notifications.
 * Optionally sends email notifications via EmailService.
 */

require_once __DIR__ . '/../services/EmailService.php';

class NotificationManager {
    private $collection;
    private $db;
    private $emailService;

    public function __construct($db = null) {
        // Accept a MongoDB\Database or fall back to global getMongoDB()
        if ($db instanceof MongoDB\Database) {
            $this->db = $db;
            $this->collection = $db->selectCollection('notifications');
        } else {
            $this->db = getMongoDB();
            $this->collection = getCollection('notifications');
        }

        // Initialize email service for optional email delivery
        try {
            $this->emailService = new EmailService();
        } catch (\Exception $e) {
            error_log("NotificationManager: EmailService init failed: " . $e->getMessage());
            $this->emailService = null;
        }
    }

    /**
     * Create a new notification document in MongoDB.
     */
    public function createNotification($user_id, $type, $title, $message, $related_id = null) {
        $doc = [
            'user_id'    => (string) $user_id,
            'type'       => $type,
            'title'      => $title,
            'message'    => $message,
            'related_id' => $related_id ? (string) $related_id : null,
            'is_read'    => false,
            'created_at' => new MongoDB\BSON\UTCDateTime(),
        ];

        $result = $this->collection->insertOne($doc);
        return $result->getInsertedCount() > 0;
    }

    /**
     * Notify a customer that their order status changed.
     * Also sends an email notification if the customer's email is available.
     */
    public function notifyOrderStatus($order_id, $customer_id, $status) {
        $statusMap = [
            'pending'    => 'received and is being reviewed',
            'processing' => 'now being processed',
            'shipped'    => 'shipped and on its way',
            'delivered'  => 'delivered successfully',
            'cancelled'  => 'cancelled',
        ];
        $statusText = $statusMap[$status] ?? ucfirst($status);
        $title   = 'Order Status Updated';
        $message = "Your order #{$order_id} has been {$statusText}.";

        // Create in-app notification
        $result = $this->createNotification($customer_id, 'order_status', $title, $message, $order_id);

        // Attempt to send email notification
        $this->sendOrderStatusEmail($customer_id, $order_id, $status);

        return $result;
    }

    /**
     * Notify a seller about low stock on one of their products.
     */
    public function notifyLowStock($product_id, $seller_id, $product_name, $current_stock) {
        $title   = 'Low Stock Alert';
        $message = "Product \"{$product_name}\" is running low on stock. Current stock: {$current_stock}.";
        return $this->createNotification($seller_id, 'low_stock', $title, $message, $product_id);
    }

    /**
     * Notify a seller about a new review on their product.
     */
    public function notifyNewReview($product_id, $seller_id, $product_name, $rating) {
        $title   = 'New Product Review';
        $message = "Your product \"{$product_name}\" received a new {$rating}-star review.";
        return $this->createNotification($seller_id, 'new_review', $title, $message, $product_id);
    }

    /**
     * Notify a seller that a new order was placed.
     */
    public function notifyOrderPlaced($order_id, $seller_id, $customer_name) {
        $title   = 'New Order Received';
        $message = "You received a new order #{$order_id} from {$customer_name}.";
        return $this->createNotification($seller_id, 'order_placed', $title, $message, $order_id);
    }

    /**
     * Notify the customer that their own order was successfully placed.
     * Also sends an email confirmation.
     */
    public function notifyOrderConfirmed($order_id, $customer_id, $total, $items = []) {
        $title   = 'Order Placed Successfully';
        $message = "Your order #{$order_id} has been placed. Total: ETB " . number_format($total, 2) . ". We'll notify you when it ships.";

        // Create in-app notification
        $result = $this->createNotification($customer_id, 'order_confirmed', $title, $message, $order_id);

        // Attempt to send email confirmation
        $this->sendOrderConfirmationEmail($customer_id, $order_id, $total, $items);

        return $result;
    }

    /**
     * Get unread notifications for a user (newest first).
     */
    public function getUnreadNotifications($user_id) {
        $cursor = $this->collection->find(
            ['user_id' => (string) $user_id, 'is_read' => false],
            ['sort' => ['created_at' => -1]]
        );
        return iterator_to_array($cursor, false);
    }

    /**
     * Get all notifications for a user with pagination.
     */
    public function getNotifications($user_id, $limit = 20, $skip = 0, $type = null, $unread_only = false) {
        $filter = ['user_id' => (string) $user_id];
        if ($type) $filter['type'] = $type;
        if ($unread_only) $filter['is_read'] = false;

        $cursor = $this->collection->find(
            $filter,
            ['sort' => ['created_at' => -1], 'limit' => (int) $limit, 'skip' => (int) $skip]
        );
        return iterator_to_array($cursor, false);
    }

    /**
     * Count total notifications matching filter (for pagination).
     */
    public function countNotifications($user_id, $type = null, $unread_only = false) {
        $filter = ['user_id' => (string) $user_id];
        if ($type) $filter['type'] = $type;
        if ($unread_only) $filter['is_read'] = false;
        return $this->collection->countDocuments($filter);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead($notification_id, $user_id) {
        $result = $this->collection->updateOne(
            [
                '_id'     => new MongoDB\BSON\ObjectId($notification_id),
                'user_id' => (string) $user_id,
            ],
            ['$set' => ['is_read' => true, 'read_at' => new MongoDB\BSON\UTCDateTime()]]
        );
        return $result->getModifiedCount() > 0;
    }

    /**
     * Mark all unread notifications for a user as read.
     */
    public function markAllAsRead($user_id) {
        $result = $this->collection->updateMany(
            ['user_id' => (string) $user_id, 'is_read' => false],
            ['$set' => ['is_read' => true, 'read_at' => new MongoDB\BSON\UTCDateTime()]]
        );
        return $result->getModifiedCount();
    }

    /**
     * Delete a notification by ID for a specific user.
     */
    public function deleteNotification($notification_id, $user_id) {
        $result = $this->collection->deleteOne([
            '_id'     => new MongoDB\BSON\ObjectId($notification_id),
            'user_id' => (string) $user_id,
        ]);
        return $result->getDeletedCount() > 0;
    }

    // ──────────────────────────────────────────────────────────────
    // Private email helpers (never break the notification flow)
    // ──────────────────────────────────────────────────────────────

    /**
     * Look up a user's email and name by their ID.
     */
    private function getUserInfo(string $userId): ?array {
        try {
            $usersCol = $this->db->selectCollection('users');
            $user = $usersCol->findOne(['_id' => new MongoDB\BSON\ObjectId($userId)]);
            if ($user) {
                return [
                    'email' => (string)($user['email'] ?? ''),
                    'name'  => (string)($user['name'] ?? 'Customer'),
                ];
            }
        } catch (\Exception $e) {
            error_log("NotificationManager: Failed to look up user {$userId}: " . $e->getMessage());
        }
        return null;
    }

    /**
     * Send order confirmation email to customer (fire-and-forget).
     */
    private function sendOrderConfirmationEmail(string $customerId, string $orderId, float $total, array $items = []): void {
        if (!$this->emailService) return;

        try {
            $userInfo = $this->getUserInfo($customerId);
            if ($userInfo && !empty($userInfo['email'])) {
                $this->emailService->sendOrderConfirmation(
                    $userInfo['email'],
                    $userInfo['name'],
                    $orderId,
                    $total,
                    $items
                );
            }
        } catch (\Exception $e) {
            error_log("NotificationManager: Order confirmation email failed: " . $e->getMessage());
        }
    }

    /**
     * Send order status update email to customer (fire-and-forget).
     */
    private function sendOrderStatusEmail(string $customerId, string $orderId, string $status): void {
        if (!$this->emailService) return;

        try {
            $userInfo = $this->getUserInfo($customerId);
            if ($userInfo && !empty($userInfo['email'])) {
                $this->emailService->sendOrderStatusUpdate(
                    $userInfo['email'],
                    $userInfo['name'],
                    $orderId,
                    $status
                );
            }
        } catch (\Exception $e) {
            error_log("NotificationManager: Order status email failed: " . $e->getMessage());
        }
    }
}
?>