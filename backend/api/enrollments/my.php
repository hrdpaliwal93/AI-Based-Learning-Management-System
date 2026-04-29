<?php
session_start();
require_once '../config/cors.php';
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden']);
    exit();
}

$student_id = $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare("
        SELECT c.*, u.name as teacher_name, e.enrolled_at,
        (SELECT COUNT(*) FROM tests t WHERE t.course_id = c.id AND t.is_published = 1) as total_tests,
        (SELECT COUNT(*) FROM test_submissions ts JOIN tests t ON ts.test_id = t.id WHERE t.course_id = c.id AND ts.student_id = ?) as completed_tests
        FROM courses c
        JOIN enrollments e ON c.id = e.course_id
        JOIN users u ON c.teacher_id = u.id
        WHERE e.student_id = ?
        ORDER BY e.enrolled_at DESC
    ");
    $stmt->execute([$student_id, $student_id]);
    $enrollments = $stmt->fetchAll();
    
    echo json_encode(['success' => true, 'data' => $enrollments]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch enrollments']);
}
