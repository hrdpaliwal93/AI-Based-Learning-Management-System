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

$test_id = $_GET['test_id'] ?? null;

if (!$test_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Test ID required']);
    exit();
}

// Check ownership
$checkStmt = $pdo->prepare("SELECT c.teacher_id FROM tests t JOIN courses c ON t.course_id = c.id WHERE t.id = ?");
$checkStmt->execute([$test_id]);
$course = $checkStmt->fetch();

if (!$course || $course['teacher_id'] != $_SESSION['user_id']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden']);
    exit();
}

try {
    $stmt = $pdo->prepare("
        SELECT ts.id, ts.score, ts.max_score, ts.percentage, ts.submitted_at, 
        u.name as student_name, u.email as student_email, u.profile_id as student_profile_id
        FROM test_submissions ts
        JOIN users u ON ts.student_id = u.id
        WHERE ts.test_id = ?
        ORDER BY ts.submitted_at DESC
    ");
    $stmt->execute([$test_id]);
    $results = $stmt->fetchAll();
    
    echo json_encode(['success' => true, 'data' => $results]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch results']);
}
