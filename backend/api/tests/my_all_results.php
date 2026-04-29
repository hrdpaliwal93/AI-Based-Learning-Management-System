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

try {
    $stmt = $pdo->prepare("
        SELECT ts.id, ts.test_id, ts.score, ts.max_score, ts.percentage, ts.submitted_at,
               t.title as test_title, t.passing_score, t.time_limit_mins,
               c.title as course_title, c.id as course_id, c.category as course_category
        FROM test_submissions ts
        JOIN tests t ON ts.test_id = t.id
        JOIN courses c ON t.course_id = c.id
        WHERE ts.student_id = ?
        ORDER BY ts.submitted_at DESC
    ");
    $stmt->execute([$_SESSION['user_id']]);
    $results = $stmt->fetchAll();
    
    echo json_encode(['success' => true, 'data' => $results]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch results']);
}
