<?php
session_start();
require_once '../config/cors.php';
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden']);
    exit();
}

$id = $_GET['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Resource ID required']);
    exit();
}

try {
    // Check ownership
    $stmt = $pdo->prepare("SELECT r.file_path, c.teacher_id FROM course_resources r JOIN courses c ON r.course_id = c.id WHERE r.id = ?");
    $stmt->execute([$id]);
    $resource = $stmt->fetch();

    if (!$resource || $resource['teacher_id'] != $_SESSION['user_id']) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden or not found']);
        exit();
    }

    // Delete file
    $file_path = '../' . $resource['file_path'];
    if (file_exists($file_path)) {
        unlink($file_path);
    }

    // Delete from DB
    $stmt = $pdo->prepare("DELETE FROM course_resources WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(['success' => true, 'message' => 'Resource deleted']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to delete resource']);
}
