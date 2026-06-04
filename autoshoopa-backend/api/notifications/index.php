<?php
require_once __DIR__ . '/../../config/cors.php';
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../utils/NotificationManager.php';

$user = Auth::requireAuth();
$userId = $user['user_id'] ?? $user['id'] ?? null;

if (!$userId) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$db = getMongoDB();
$notificationManager = new NotificationManager($db);

$method = $_SERVER['REQUEST_METHOD'];

// ──────────────────────────────────────────────
// GET /api/notifications  — fetch notifications
// ──────────────────────────────────────────────
if ($method === 'GET') {
    $page        = max(1, (int)($_GET['page']  ?? 1));
    $limit       = min(50, max(1, (int)($_GET['limit'] ?? 15)));
    $skip        = ($page - 1) * $limit;
    $type        = $_GET['type']        ?? null;
    $unreadOnly  = ($_GET['unread_only'] ?? 'false') === 'true';

    $notifications = $notificationManager->getNotifications($userId, $limit, $skip, $type, $unreadOnly);
    $total         = $notificationManager->countNotifications($userId, $type, $unreadOnly);
    $unreadCount   = $notificationManager->countNotifications($userId, null, true);

    // Serialize for JSON
    $formatted = array_map(function ($n) {
        $n = (array) $n;
        if (isset($n['_id'])) { $n['id'] = (string) $n['_id']; unset($n['_id']); }
        if (isset($n['created_at']) && $n['created_at'] instanceof MongoDB\BSON\UTCDateTime) {
            $n['created_at'] = $n['created_at']->toDateTime()->format('Y-m-d H:i:s');
        }
        if (isset($n['read_at']) && $n['read_at'] instanceof MongoDB\BSON\UTCDateTime) {
            $n['read_at'] = $n['read_at']->toDateTime()->format('Y-m-d H:i:s');
        }
        return $n;
    }, $notifications);

    http_response_code(200);
    echo json_encode([
        'notifications'  => $formatted,
        'total'          => $total,
        'unread_count'   => $unreadCount,
        'page'           => $page,
        'limit'          => $limit,
        'total_pages'    => $total > 0 ? (int) ceil($total / $limit) : 1,
    ]);
    exit;
}

// ──────────────────────────────────────────────
// POST /api/notifications — mark read / mark all
// ──────────────────────────────────────────────
if ($method === 'POST') {
    $body   = json_decode(file_get_contents('php://input'), true) ?? [];
    $action = $body['action'] ?? '';

    if ($action === 'mark_all_read') {
        $count = $notificationManager->markAllAsRead($userId);
        http_response_code(200);
        echo json_encode(['success' => true, 'updated' => $count]);
        exit;
    }

    if ($action === 'mark_read' && !empty($body['notification_id'])) {
        $ok = $notificationManager->markAsRead($body['notification_id'], $userId);
        http_response_code(200);
        echo json_encode(['success' => $ok]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['error' => 'Unknown action. Use mark_read or mark_all_read.']);
    exit;
}

// ──────────────────────────────────────────────
// DELETE /api/notifications?id=...
// ──────────────────────────────────────────────
if ($method === 'DELETE') {
    $notifId = $_GET['id'] ?? null;
    if (!$notifId) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing notification id']);
        exit;
    }
    try {
        $ok = $notificationManager->deleteNotification($notifId, $userId);
        http_response_code(200);
        echo json_encode(['success' => $ok]);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);