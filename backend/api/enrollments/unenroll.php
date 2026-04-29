<?php
session_start();
require_once '../config/cors.php';
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$course_id = $input['course_id'] ?? null;

if (!$course_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Course ID required']);
    exit();
}

$student_id = $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare("DELETE FROM enrollments WHERE student_id = ? AND course_id = ?");
    $stmt->execute([$student_id, $course_id]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Successfully unenrolled']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Enrollment not found']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to unenroll']);
}
