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

$student_id = $_SESSION['user_id'];

try {
    // Top stats
    $stmt1 = $pdo->prepare("SELECT COUNT(*) FROM enrollments WHERE student_id = ?");
    $stmt1->execute([$student_id]);
    $courses_enrolled = $stmt1->fetchColumn();

    $stmt2 = $pdo->prepare("SELECT COUNT(*) FROM test_submissions WHERE student_id = ?");
    $stmt2->execute([$student_id]);
    $tests_taken = $stmt2->fetchColumn();

    $stmt3 = $pdo->prepare("SELECT AVG(percentage) FROM test_submissions WHERE student_id = ?");
    $stmt3->execute([$student_id]);
    $avg_score = round((float)$stmt3->fetchColumn(), 1);

    // Pending tests: Tests in enrolled courses that are published, have not passed due_date, and student hasn't submitted
    $stmt4 = $pdo->prepare("
        SELECT COUNT(*) 
        FROM tests t
        JOIN enrollments e ON t.course_id = e.course_id
        WHERE e.student_id = ? 
        AND t.is_published = 1 
        AND (t.due_date IS NULL OR t.due_date > NOW())
        AND NOT EXISTS (SELECT 1 FROM test_submissions ts WHERE ts.test_id = t.id AND ts.student_id = ?)
    ");
    $stmt4->execute([$student_id, $student_id]);
    $pending_tests = $stmt4->fetchColumn();

    // Enrolled courses with progress
    $stmt5 = $pdo->prepare("
        SELECT c.id, c.title, c.category,
        (SELECT COUNT(*) FROM tests t WHERE t.course_id = c.id AND t.is_published = 1) as total_tests,
        (SELECT COUNT(*) FROM test_submissions ts JOIN tests t ON ts.test_id = t.id WHERE t.course_id = c.id AND ts.student_id = ?) as completed_tests
        FROM courses c
        JOIN enrollments e ON c.id = e.course_id
        WHERE e.student_id = ?
        LIMIT 4
    ");
    $stmt5->execute([$student_id, $student_id]);
    $courses = $stmt5->fetchAll();

    // Upcoming tests
    $stmt6 = $pdo->prepare("
        SELECT t.id, t.title, t.due_date, c.title as course_title
        FROM tests t
        JOIN enrollments e ON t.course_id = e.course_id
        JOIN courses c ON t.course_id = c.id
        WHERE e.student_id = ? 
        AND t.is_published = 1
        AND t.due_date IS NOT NULL 
        AND t.due_date > NOW()
        AND NOT EXISTS (SELECT 1 FROM test_submissions ts WHERE ts.test_id = t.id AND ts.student_id = ?)
        ORDER BY t.due_date ASC
        LIMIT 3
    ");
    $stmt6->execute([$student_id, $student_id]);
    $upcoming_tests = $stmt6->fetchAll();

    // Recent activity (Last 5 test submissions)
    $stmt7 = $pdo->prepare("
        SELECT 'test_completed' as type, ts.submitted_at as date, ts.percentage, t.title as test_title, c.title as course_title
        FROM test_submissions ts
        JOIN tests t ON ts.test_id = t.id
        JOIN courses c ON t.course_id = c.id
        WHERE ts.student_id = ?
        ORDER BY ts.submitted_at DESC
        LIMIT 5
    ");
    $stmt7->execute([$student_id]);
    $recent_activity = $stmt7->fetchAll();

    echo json_encode([
        'success' => true,
        'data' => [
            'stats' => [
                'courses_enrolled' => $courses_enrolled,
                'tests_taken' => $tests_taken,
                'avg_score' => $avg_score,
                'pending_tests' => $pending_tests
            ],
            'courses' => $courses,
            'upcoming_tests' => $upcoming_tests,
            'recent_activity' => $recent_activity
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to load dashboard']);
}
