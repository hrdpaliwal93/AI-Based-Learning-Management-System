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

$test_id = $_GET['test_id'] ?? null;

if (!$test_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Test ID required']);
    exit();
}

try {
    $stmt = $pdo->prepare("
        SELECT ts.*, t.title as test_title, t.passing_score, c.title as course_title, c.id as course_id
        FROM test_submissions ts
        JOIN tests t ON ts.test_id = t.id
        JOIN courses c ON t.course_id = c.id
        WHERE ts.test_id = ? AND ts.student_id = ?
    ");
    $stmt->execute([$test_id, $_SESSION['user_id']]);
    $submission = $stmt->fetch();
    
    if (!$submission) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Result not found']);
        exit();
    }
    
    // Get answers and questions
    $ansStmt = $pdo->prepare("
        SELECT sa.*, q.question_text, q.question_type, q.options_json, q.correct_answer as actual_correct, q.marks
        FROM submission_answers sa
        JOIN questions q ON sa.question_id = q.id
        WHERE sa.submission_id = ?
        ORDER BY q.order_index ASC
    ");
    $ansStmt->execute([$submission['id']]);
    $answers = $ansStmt->fetchAll();
    
    foreach ($answers as &$ans) {
        if ($ans['options_json']) {
            $ans['options'] = json_decode($ans['options_json'], true);
        }
        unset($ans['options_json']);
    }
    
    $submission['answers'] = $answers;
    
    echo json_encode(['success' => true, 'data' => $submission]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch results']);
}
