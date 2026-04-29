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

$id = $_GET['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Course ID is required']);
    exit();
}

// Ownership check
$stmt = $pdo->prepare("SELECT teacher_id FROM courses WHERE id = ?");
$stmt->execute([$id]);
$course = $stmt->fetch();

if (!$course || $course['teacher_id'] != $_SESSION['user_id']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden']);
    exit();
}

try {
    $stmt = $pdo->prepare("
        SELECT u.id, u.name, u.email, u.profile_id, e.enrolled_at,
        (SELECT COUNT(*) FROM test_submissions ts JOIN tests t ON ts.test_id = t.id WHERE t.course_id = ? AND ts.student_id = u.id) as tests_taken,
        (SELECT AVG(percentage) FROM test_submissions ts JOIN tests t ON ts.test_id = t.id WHERE t.course_id = ? AND ts.student_id = u.id) as avg_score
        FROM enrollments e
        JOIN users u ON e.student_id = u.id
        WHERE e.course_id = ?
        ORDER BY u.name ASC
    ");
    $stmt->execute([$id, $id, $id]);
    $students = $stmt->fetchAll();
    
    echo json_encode(['success' => true, 'data' => $students]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch students']);
}
