<?php
// Groq AI Configuration
define('GROQ_API_KEY', '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');
define('GROQ_API_URL', 'https://api.groq.com/openai/v1/chat/completions');
define('GROQ_MODEL', 'llama-3.3-70b-versatile');

function callGeminiAPI($prompt) {
    $data = [
        "model" => GROQ_MODEL,
        "messages" => [
            [
                "role" => "user",
                "content" => $prompt
            ]
        ],
        "temperature" => 0.7,
        "max_tokens" => 4096,
    ];

    $maxRetries = 3;
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
        $curl_error = curl_error($ch);
        curl_close($ch);

        if ($http_status === 200) {
            break;
        }

        if (($http_status === 503 || $http_status === 429) && $attempt < $maxRetries) {
            sleep(5);
            continue;
        }
    }

    if ($curl_error) {
        return ['success' => false, 'error' => "cURL error: $curl_error"];
    }

    if ($http_status !== 200) {
        return ['success' => false, 'error' => "API returned status $http_status", 'raw' => $response];
    }

    $decoded = json_decode($response, true);
    if (isset($decoded['choices'][0]['message']['content'])) {
        return ['success' => true, 'text' => $decoded['choices'][0]['message']['content']];
    }

    return ['success' => false, 'error' => 'Unexpected API response structure', 'raw' => $response];
}
