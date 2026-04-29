<?php
session_start();
require_once '../config/cors.php';
require_once '../config/ai.php';

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
$topic = $input['topic'] ?? '';
$count = $input['count'] ?? 3;

if (empty($topic)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Topic is required']);
    exit();
}

// Instruction to generate a strictly formatted JSON array
$prompt = "You are an expert engineering professor. Generate $count multiple-choice questions about the topic: '$topic'.
You must respond with ONLY a valid raw JSON array of objects. Do not wrap it in markdown block quotes like ```json.
The structure MUST be exactly:
[
  {
    \"question_text\": \"The text of the question?\",
    \"question_type\": \"mcq\",
    \"marks\": 1,
    \"options_json\": [
      {\"text\": \"First option\", \"is_correct\": false},
      {\"text\": \"Second option\", \"is_correct\": true},
      {\"text\": \"Third option\", \"is_correct\": false},
      {\"text\": \"Fourth option\", \"is_correct\": false}
    ]
  }
]";

$result = callGeminiAPI($prompt);

if ($result['success']) {
    $text = trim($result['text']);
    // Clean up markdown if AI includes it despite instructions
    if (strpos($text, '```json') === 0) {
        $text = substr($text, 7);
        if (strrpos($text, '```') !== false) {
            $text = substr($text, 0, strrpos($text, '```'));
        }
    }
    
    $json = json_decode(trim($text), true);
    
    if (json_last_error() === JSON_ERROR_NONE) {
        echo json_encode(['success' => true, 'data' => $json]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'AI returned invalid format']);
    }
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to connect to AI', 'details' => $result['error']]);
}
