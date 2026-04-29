<?php
session_start();
require_once '../config/cors.php';
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
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

if (!isset($input['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Course ID is required']);
    exit();
}

$id = $input['id'];

// Ownership check
$stmt = $pdo->prepare("SELECT teacher_id FROM courses WHERE id = ?");
$stmt->execute([$id]);
$course = $stmt->fetch();

if (!$course) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Course not found']);
    exit();
}

if ($course['teacher_id'] != $_SESSION['user_id']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Not your course']);
    exit();
}

$title = trim($input['title']);
$description = $input['description'] ?? null;
$category = $input['category'] ?? null;
$thumbnail_url = $input['thumbnail_url'] ?? null;
$objectives = isset($input['objectives']) ? json_encode($input['objectives']) : null;
$is_published = isset($input['is_published']) ? (int)$input['is_published'] : 1;

try {
    $stmt = $pdo->prepare("UPDATE courses SET title = ?, description = ?, category = ?, thumbnail_url = ?, objectives = ?, is_published = ? WHERE id = ?");
    $stmt->execute([$title, $description, $category, $thumbnail_url, $objectives, $is_published, $id]);
    
    echo json_encode(['success' => true, 'message' => 'Course updated']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to update course']);
}
