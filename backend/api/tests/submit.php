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

if (!isset($input['test_id']) || !isset($input['answers'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Test ID and answers required']);
    exit();
}

$test_id = $input['test_id'];
$student_id = $_SESSION['user_id'];

// Check one attempt
$checkStmt = $pdo->prepare("SELECT id FROM test_submissions WHERE test_id = ? AND student_id = ?");
$checkStmt->execute([$test_id, $student_id]);
if ($checkStmt->fetch()) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Test already submitted']);
    exit();
}

try {
    $pdo->beginTransaction();
    
    // Fetch all questions for grading
    $qStmt = $pdo->prepare("SELECT * FROM questions WHERE test_id = ?");
    $qStmt->execute([$test_id]);
    $questions = $qStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $qMap = [];
    $max_score = 0;
    foreach ($questions as $q) {
        $qMap[$q['id']] = $q;
        $max_score += $q['marks'];
    }
    
    $total_score = 0;
    $evaluated_answers = [];
    
    foreach ($input['answers'] as $ans) {
        $q_id = $ans['question_id'];
        $s_ans = $ans['student_answer'];
        $q = $qMap[$q_id] ?? null;
        
        if (!$q) continue;
        
        $is_correct = false;
        $marks_awarded = 0;
        
        if ($q['question_type'] === 'mcq') {
            $options = json_decode($q['options_json'], true);
            foreach ($options as $opt) {
                if ($opt['text'] === $s_ans && isset($opt['is_correct']) && $opt['is_correct']) {
                    $is_correct = true;
                    $marks_awarded = $q['marks'];
                    break;
                }
            }
        } elseif ($q['question_type'] === 'truefalse') {
            if (strtolower($s_ans) === strtolower($q['correct_answer'])) {
                $is_correct = true;
                $marks_awarded = $q['marks'];
            }
        } elseif ($q['question_type'] === 'short') {
            // Simple keyword match (case insensitive)
            if (stripos(trim($s_ans), trim($q['correct_answer'])) !== false) {
                $is_correct = true;
                $marks_awarded = $q['marks'];
            }
        }
        
        $total_score += $marks_awarded;
        $evaluated_answers[] = [
            'question_id' => $q_id,
            'student_answer' => $s_ans,
            'is_correct' => $is_correct ? 1 : 0,
            'marks_awarded' => $marks_awarded
        ];
    }
    
    $percentage = $max_score > 0 ? ($total_score / $max_score) * 100 : 0;
    
    // Insert submission
    $subStmt = $pdo->prepare("INSERT INTO test_submissions (test_id, student_id, score, max_score, percentage) VALUES (?, ?, ?, ?, ?)");
    $subStmt->execute([$test_id, $student_id, $total_score, $max_score, $percentage]);
    $submission_id = $pdo->lastInsertId();
    
    // Insert answers
    $ansStmt = $pdo->prepare("INSERT INTO submission_answers (submission_id, question_id, student_answer, is_correct, marks_awarded) VALUES (?, ?, ?, ?, ?)");
    foreach ($evaluated_answers as $ea) {
        $ansStmt->execute([$submission_id, $ea['question_id'], $ea['student_answer'], $ea['is_correct'], $ea['marks_awarded']]);
    }
    
    $pdo->commit();
    echo json_encode(['success' => true, 'data' => ['submission_id' => $submission_id, 'percentage' => $percentage]]);
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Submission failed: ' . $e->getMessage()]);
}
