<?php
session_start();
require_once '../config/cors.php';
require_once '../config/db.php';
require_once '../config/ai.php';

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
    // Fetch student's test submissions
    $stmt = $pdo->prepare("
        SELECT t.title as test_title, c.title as course_title, ts.percentage 
        FROM test_submissions ts 
        JOIN tests t ON ts.test_id = t.id 
        JOIN courses c ON t.course_id = c.id 
        WHERE ts.student_id = ?
        ORDER BY ts.submitted_at DESC
        LIMIT 10
    ");
    $stmt->execute([$student_id]);
    $submissions = $stmt->fetchAll();

    // Fetch enrolled courses
    $stmt2 = $pdo->prepare("
        SELECT c.title, c.category 
        FROM enrollments e 
        JOIN courses c ON e.course_id = c.id 
        WHERE e.student_id = ?
    ");
    $stmt2->execute([$student_id]);
    $courses = $stmt2->fetchAll();

    if (empty($courses)) {
        echo json_encode(['success' => true, 'data' => 'Enroll in some courses to get personalized recommendations!']);
        exit();
    }

    // Build the prompt
    $prompt = "You are an AI learning advisor for an engineering student. Based on their recent performance and enrolled courses, provide 3 short, actionable study recommendations or focus areas.\n\n";
    $prompt .= "Enrolled Courses: " . implode(", ", array_column($courses, 'title')) . "\n\n";
    
    if (!empty($submissions)) {
        $prompt .= "Recent Test Scores:\n";
        foreach ($submissions as $sub) {
            $prompt .= "- {$sub['course_title']}: {$sub['test_title']} ({$sub['percentage']}%)\n";
        }
    } else {
        $prompt .= "The student hasn't taken any tests yet.\n";
    }

    $prompt .= "\nFormat the response as a bulleted list. Keep it very concise and encouraging.";

    $result = callGeminiAPI($prompt);

    if ($result['success']) {
        echo json_encode(['success' => true, 'data' => $result['text']]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'AI recommendation failed', 'details' => $result['error']]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
