<?php
session_start();
require_once '../config/cors.php';
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit();
}

$course_id = $_GET['course_id'] ?? null;

if (!$course_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Course ID required']);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT * FROM course_resources WHERE course_id = ? ORDER BY created_at DESC");
    $stmt->execute([$course_id]);
    $resources = $stmt->fetchAll();
    
    echo json_encode(['success' => true, 'data' => $resources]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch resources']);
}
