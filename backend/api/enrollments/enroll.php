<?php
session_start();
require_once '../config/cors.php';
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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

if (!isset($input['course_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Course ID required']);
    exit();
}

$course_id = $input['course_id'];
$student_id = $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare("INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)");
    $stmt->execute([$student_id, $course_id]);
    
    echo json_encode(['success' => true, 'message' => 'Successfully enrolled']);
} catch (PDOException $e) {
    if ($e->errorInfo[1] === 1062) { // Duplicate entry
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Already enrolled in this course']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to enroll']);
    }
}
