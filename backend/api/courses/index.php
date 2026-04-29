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

try {
    $stmt = $pdo->query("
        SELECT c.*, u.name as teacher_name, 
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as enrolled_count
        FROM courses c 
        JOIN users u ON c.teacher_id = u.id 
        WHERE c.is_published = 1 
        ORDER BY c.created_at DESC
    ");
    $courses = $stmt->fetchAll();
    
    echo json_encode(['success' => true, 'data' => $courses]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch courses']);
}
