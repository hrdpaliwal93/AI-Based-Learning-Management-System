<?php
session_start();
require_once '../config/cors.php';
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['course_id']) || !isset($input['title'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Course ID and Title required']);
    exit();
}

// Check ownership
$stmt = $pdo->prepare("SELECT teacher_id FROM courses WHERE id = ?");
$stmt->execute([$input['course_id']]);
$course = $stmt->fetch();

if (!$course || $course['teacher_id'] != $_SESSION['user_id']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden']);
    exit();
}

try {
    $pdo->beginTransaction();
    
    // Create test
    $stmt = $pdo->prepare("INSERT INTO tests (course_id, title, description, time_limit_mins, due_date, passing_score, is_published) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $input['course_id'],
        $input['title'],
        $input['description'] ?? null,
        $input['time_limit_mins'] ?? null,
        $input['due_date'] ?? null,
        $input['passing_score'] ?? 50,
        $input['is_published'] ?? 0
    ]);
    
    $test_id = $pdo->lastInsertId();
    
    // Create questions
    if (isset($input['questions']) && is_array($input['questions'])) {
        $stmtQ = $pdo->prepare("INSERT INTO questions (test_id, question_text, question_type, options_json, correct_answer, marks, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)");
        
        foreach ($input['questions'] as $index => $q) {
            $stmtQ->execute([
                $test_id,
                $q['question_text'],
                $q['question_type'],
                isset($q['options']) ? json_encode($q['options']) : null,
                $q['correct_answer'] ?? null,
                $q['marks'] ?? 1,
                $index
            ]);
        }
    }
    
    $pdo->commit();
    echo json_encode(['success' => true, 'data' => ['id' => $test_id], 'message' => 'Test created']);
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to create test: ' . $e->getMessage()]);
}
