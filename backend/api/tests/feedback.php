<?php
session_start();
require_once '../config/cors.php';
require_once '../config/db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Submit Feedback
    if ($_SESSION['role'] !== 'student') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Only students can submit feedback']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $test_id = $input['test_id'] ?? null;
    $rating = $input['rating'] ?? null;
    $comments = $input['comments'] ?? null;

    if (!$test_id || !$rating) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit();
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO test_feedback (test_id, student_id, rating, comments) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating = VALUES(rating), comments = VALUES(comments)");
        $stmt->execute([$test_id, $_SESSION['user_id'], $rating, $comments]);
        
        echo json_encode(['success' => true, 'message' => 'Feedback submitted successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to submit feedback']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get Feedback (for student to view their own, or teacher to view all)
    $test_id = $_GET['test_id'] ?? null;
    
    if (!$test_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Test ID required']);
        exit();
    }

    try {
        if ($_SESSION['role'] === 'student') {
            $stmt = $pdo->prepare("SELECT * FROM test_feedback WHERE test_id = ? AND student_id = ?");
            $stmt->execute([$test_id, $_SESSION['user_id']]);
            $feedback = $stmt->fetch();
            echo json_encode(['success' => true, 'data' => $feedback]);
        } else {
            $stmt = $pdo->prepare("SELECT f.*, u.name as student_name FROM test_feedback f JOIN users u ON f.student_id = u.id WHERE test_id = ? ORDER BY f.created_at DESC");
            $stmt->execute([$test_id]);
            $feedback = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $feedback]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to fetch feedback']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
