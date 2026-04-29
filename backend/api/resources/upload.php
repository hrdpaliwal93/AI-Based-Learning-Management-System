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

$course_id = $_POST['course_id'] ?? null;
$title = $_POST['title'] ?? null;
$type = $_POST['type'] ?? 'document';

if (!$course_id || !$title || !isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit();
}

// Ownership check
$stmt = $pdo->prepare("SELECT teacher_id FROM courses WHERE id = ?");
$stmt->execute([$course_id]);
$course = $stmt->fetch();

if (!$course || $course['teacher_id'] != $_SESSION['user_id']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden']);
    exit();
}

$upload_dir = '../uploads/';
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

$file = $_FILES['file'];
$file_ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed_exts = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'mp4', 'avi', 'mkv', 'zip'];

if (!in_array($file_ext, $allowed_exts)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid file type']);
    exit();
}

$new_filename = uniqid('res_') . '.' . $file_ext;
$target_path = $upload_dir . $new_filename;

if (move_uploaded_file($file['tmp_name'], $target_path)) {
    try {
        $stmt = $pdo->prepare("INSERT INTO course_resources (course_id, title, type, file_path) VALUES (?, ?, ?, ?)");
        // Store relative path for frontend access assuming backend is served at /eduportal/api/
        $stmt->execute([$course_id, $title, $type, 'uploads/' . $new_filename]);
        
        echo json_encode(['success' => true, 'message' => 'Resource uploaded successfully']);
    } catch (PDOException $e) {
        // If DB insert fails, delete the uploaded file
        unlink($target_path);
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to save resource']);
    }
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to upload file']);
}
