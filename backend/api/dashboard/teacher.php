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

$teacher_id = $_SESSION['user_id'];

try {
    // Total courses
    $stmt1 = $pdo->prepare("SELECT COUNT(*) FROM courses WHERE teacher_id = ?");
    $stmt1->execute([$teacher_id]);
    $total_courses = $stmt1->fetchColumn();

    // Total unique students across all courses
    $stmt2 = $pdo->prepare("
        SELECT COUNT(DISTINCT e.student_id) 
        FROM enrollments e 
        JOIN courses c ON e.course_id = c.id 
        WHERE c.teacher_id = ?
    ");
    $stmt2->execute([$teacher_id]);
    $total_students = $stmt2->fetchColumn();

    // Tests created
    $stmt3 = $pdo->prepare("
        SELECT COUNT(*) FROM tests t 
        JOIN courses c ON t.course_id = c.id 
        WHERE c.teacher_id = ?
    ");
    $stmt3->execute([$teacher_id]);
    $tests_created = $stmt3->fetchColumn();

    // Average class score across all tests
    $stmt4 = $pdo->prepare("
        SELECT AVG(ts.percentage) 
        FROM test_submissions ts 
        JOIN tests t ON ts.test_id = t.id 
        JOIN courses c ON t.course_id = c.id 
        WHERE c.teacher_id = ?
    ");
    $stmt4->execute([$teacher_id]);
    $avg_class_score = round((float)$stmt4->fetchColumn(), 1);

    // Chart Data: Enrollments per course
    $stmt5 = $pdo->prepare("
        SELECT c.title as name, COUNT(e.id) as students 
        FROM courses c 
        LEFT JOIN enrollments e ON c.id = e.course_id 
        WHERE c.teacher_id = ? 
        GROUP BY c.id
        ORDER BY students DESC LIMIT 5
    ");
    $stmt5->execute([$teacher_id]);
    $enrollment_chart = $stmt5->fetchAll();

    // Chart Data: Avg score per test (Last 5 tests)
    $stmt6 = $pdo->prepare("
        SELECT t.title as name, AVG(ts.percentage) as score
        FROM tests t
        JOIN courses c ON t.course_id = c.id
        LEFT JOIN test_submissions ts ON t.id = ts.test_id
        WHERE c.teacher_id = ? AND t.is_published = 1
        GROUP BY t.id
        ORDER BY t.created_at DESC LIMIT 5
    ");
    $stmt6->execute([$teacher_id]);
    $performance_chart = array_reverse($stmt6->fetchAll()); // Chronological

    // Recent submissions
    $stmt7 = $pdo->prepare("
        SELECT ts.percentage, ts.submitted_at, u.name as student_name, t.title as test_title
        FROM test_submissions ts
        JOIN users u ON ts.student_id = u.id
        JOIN tests t ON ts.test_id = t.id
        JOIN courses c ON t.course_id = c.id
        WHERE c.teacher_id = ?
        ORDER BY ts.submitted_at DESC LIMIT 5
    ");
    $stmt7->execute([$teacher_id]);
    $recent_submissions = $stmt7->fetchAll();

    echo json_encode([
        'success' => true,
        'data' => [
            'stats' => [
                'total_courses' => $total_courses,
                'total_students' => $total_students,
                'tests_created' => $tests_created,
                'avg_class_score' => $avg_class_score
            ],
            'enrollment_chart' => $enrollment_chart,
            'performance_chart' => $performance_chart,
            'recent_submissions' => $recent_submissions
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to load dashboard']);
}
