<?php
session_start();

function isAuthenticated() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

function isSeller() {
    return isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'seller';
}

function getUserId() {
    return $_SESSION['user_id'] ?? null;
}

function getUserRole() {
    return $_SESSION['user_role'] ?? null;
}

function requireAuth() {
    if (!isAuthenticated()) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        exit;
    }
}

function requireSeller() {
    requireAuth();
    if (!isSeller()) {
        http_response_code(403);
        echo json_encode(['error' => 'Seller access required']);
        exit;
    }
} 