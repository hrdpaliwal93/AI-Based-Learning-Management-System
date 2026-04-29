<?php
session_start();
require_once '../config/cors.php';
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['name']) || !isset($input['email']) || !isset($input['password']) || !isset($input['role'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit();
}

$name = trim($input['name']);
$email = trim($input['email']);
$password = $input['password'];
$role = $input['role'];

if (!in_array($role, ['student', 'teacher'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid role']);
    exit();
}

// Check if email already exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email already exists']);
    exit();
}

$password_hash = password_hash($password, PASSWORD_BCRYPT);
$profile_id = $input['profile_id'] ?? null;
$department = $role === 'teacher' ? ($input['department'] ?? null) : null;
$program = $role === 'student' ? ($input['program'] ?? null) : null;
$year_of_study = $role === 'student' ? ($input['year_of_study'] ?? null) : null;

try {
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, role, profile_id, department, program, year_of_study) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$name, $email, $password_hash, $role, $profile_id, $department, $program, $year_of_study]);
    
    $user_id = $pdo->lastInsertId();
    
    // Automatically log in after registration
    $_SESSION['user_id'] = $user_id;
    $_SESSION['role'] = $role;
    $_SESSION['email'] = $email;
    $_SESSION['name'] = $name;
    
    echo json_encode([
        'success' => true,
        'data' => [
            'id' => $user_id,
            'name' => $name,
            'email' => $email,
            'role' => $role
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $e->getMessage()]);
}
