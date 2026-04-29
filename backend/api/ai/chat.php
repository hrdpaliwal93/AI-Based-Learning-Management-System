<?php
session_start();
require_once '../config/cors.php';
require_once '../config/ai.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$message = $input['message'] ?? '';
$history = $input['history'] ?? [];

if (empty($message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Message is required']);
    exit();
}

// Build messages array for Groq (OpenAI-compatible format)
$messages = [];

// System message
$messages[] = [
    "role" => "system",
    "content" => "You are EduBot, an AI learning assistant for engineering students in the EduPortal LMS. You should be helpful, concise, and encouraging. Answer their academic questions clearly. Do not write huge walls of text, use bullet points if needed."
];

// Add conversation history
foreach ($history as $msg) {
    $role = $msg['role'] === 'bot' ? 'assistant' : 'user';
    $messages[] = [
        "role" => $role,
        "content" => $msg['content']
    ];
}

// Add current message
$messages[] = [
    "role" => "user",
    "content" => $message
];

$data = [
    "model" => GROQ_MODEL,
    "messages" => $messages,
    "temperature" => 0.7,
    "max_tokens" => 1024,
];

$maxRetries = 3;
$response = '';
$http_status = 0;

for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
    $ch = curl_init(GROQ_API_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . GROQ_API_KEY
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);

    $response = curl_exec($ch);
    $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($http_status === 200) {
        break;
    }

    if (($http_status === 503 || $http_status === 429) && $attempt < $maxRetries) {
        sleep(5);
        continue;
    }
}

if ($http_status === 429) {
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'AI rate limit exceeded. Please wait a minute and try again.']);
    exit();
}

if ($http_status !== 200) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'AI service temporarily unavailable. Please try again shortly.']);
    exit();
}

$decoded = json_decode($response, true);
if (isset($decoded['choices'][0]['message']['content'])) {
    echo json_encode([
        'success' => true, 
        'reply' => $decoded['choices'][0]['message']['content']
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Unexpected AI response']);
}
