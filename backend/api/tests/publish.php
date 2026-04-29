<?php
session_start();
require_once '../config/cors.php';
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id']) || !isset($input['is_published'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Test ID and status required']);
    exit();
}

// Check ownership
$stmt = $pdo->prepare("
    SELECT c.teacher_id FROM tests t 
    JOIN courses c ON t.course_id = c.id 
    WHERE t.id = ?
");
$stmt->execute([$input['id']]);
$course = $stmt->fetch();

if (!$course || $course['teacher_id'] != $_SESSION['user_id']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden']);
    exit();
}

try {
    $stmt = $pdo->prepare("UPDATE tests SET is_published = ? WHERE id = ?");
    $stmt->execute([(int)$input['is_published'], $input['id']]);
    
    echo json_encode(['success' => true, 'message' => 'Test status updated']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to update status']);
}
