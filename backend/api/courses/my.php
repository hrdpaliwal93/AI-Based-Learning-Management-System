<?php
session_start();
require_once '../config/cors.php';
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden']);
    exit();
}

try {
    $stmt = $pdo->prepare("
        SELECT c.*, 
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as enrolled_count,
        (SELECT COUNT(*) FROM tests t WHERE t.course_id = c.id) as tests_count
        FROM courses c 
        WHERE c.teacher_id = ? 
        ORDER BY c.created_at DESC
    ");
    $stmt->execute([$_SESSION['user_id']]);
    $courses = $stmt->fetchAll();
    
    echo json_encode(['success' => true, 'data' => $courses]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch courses']);
}
