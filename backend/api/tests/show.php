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
    echo json_encode(['success' => false, 'message' => 'Test ID required']);
    exit();
}

try {
    $stmt = $pdo->prepare("
        SELECT t.*, c.title as course_title, c.teacher_id
        FROM tests t 
        JOIN courses c ON t.course_id = c.id 
        WHERE t.id = ?
    ");
    $stmt->execute([$id]);
    $test = $stmt->fetch();
    
    if (!$test) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Test not found']);
        exit();
    }
    
    // Access control: Teacher must own course, Student must be enrolled
    if ($_SESSION['role'] === 'student') {
        $checkStmt = $pdo->prepare("SELECT 1 FROM enrollments WHERE course_id = ? AND student_id = ?");
        $checkStmt->execute([$test['course_id'], $_SESSION['user_id']]);
        if (!$checkStmt->fetch()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Not enrolled in this course']);
            exit();
        }
    } elseif ($_SESSION['role'] === 'teacher' && $test['teacher_id'] != $_SESSION['user_id']) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden']);
        exit();
    }
    
    // Fetch questions
    $stmtQ = $pdo->prepare("SELECT * FROM questions WHERE test_id = ? ORDER BY order_index ASC");
    $stmtQ->execute([$id]);
    $questions = $stmtQ->fetchAll();
    
    // Parse JSON options and hide correct answers for students
    foreach ($questions as &$q) {
        if ($q['options_json']) {
            $q['options'] = json_decode($q['options_json'], true);
        }
        
        if ($_SESSION['role'] === 'student') {
            unset($q['correct_answer']);
            if (isset($q['options'])) {
                foreach ($q['options'] as &$opt) {
                    unset($opt['is_correct']);
                }
            }
        }
        unset($q['options_json']);
    }
    
    $test['questions'] = $questions;
    
    echo json_encode(['success' => true, 'data' => $test]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch test']);
}
