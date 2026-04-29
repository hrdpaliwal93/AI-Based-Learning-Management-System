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

if (!isset($input['title'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Title is required']);
    exit();
}

$title = trim($input['title']);
$description = $input['description'] ?? null;
$category = $input['category'] ?? null;
$thumbnail_url = $input['thumbnail_url'] ?? null;
$objectives = isset($input['objectives']) ? json_encode($input['objectives']) : null;
$is_published = isset($input['is_published']) ? (int)$input['is_published'] : 1;

try {
    $stmt = $pdo->prepare("INSERT INTO courses (teacher_id, title, description, category, thumbnail_url, objectives, is_published) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$_SESSION['user_id'], $title, $description, $category, $thumbnail_url, $objectives, $is_published]);
    
    echo json_encode(['success' => true, 'data' => ['id' => $pdo->lastInsertId()]]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to create course: ' . $e->getMessage()]);
}
