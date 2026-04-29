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

$id = $_GET['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Course ID required']);
    exit();
}

try {
    $stmt = $pdo->prepare("
        SELECT c.*, u.name as teacher_name,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as enrolled_count
        FROM courses c 
        JOIN users u ON c.teacher_id = u.id 
        WHERE c.id = ?
    ");
    $stmt->execute([$id]);
    $course = $stmt->fetch();
    
    if (!$course) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Course not found']);
        exit();
    }
    
    if ($course['objectives']) {
        $course['objectives'] = json_decode($course['objectives'], true);
    }
    
    echo json_encode(['success' => true, 'data' => $course]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch course']);
}
