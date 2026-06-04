<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/config.php';

use Google\Cloud\Core\ServiceBuilder;
use Google\Cloud\Core\ExponentialBackoff;

class GeminiService {
    private $apiKey;
    private $model;
    private $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

    public function __construct() {
        $this->apiKey = GEMINI_API_KEY;
        $this->model = 'gemini-pro';
    }

    public function getPartsAdvice($query, $context = []) {
        try {
            $url = $this->baseUrl . '?key=' . $this->apiKey;
            
            // Prepare the prompt with context
            $prompt = "You are an expert auto parts advisor. ";
            $prompt .= "Please provide advice about the following query: " . $query;
            
            if (!empty($context)) {
                $prompt .= "\nContext: " . json_encode($context);
            }
            
            $prompt .= "\nPlease provide a helpful, accurate response focusing on auto parts recommendations and compatibility.";

            $data = [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'topK' => 40,
                    'topP' => 0.95,
                    'maxOutputTokens' => 1024,
                ]
            ];

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json'
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode !== 200) {
                throw new Exception('Gemini API request failed with status code: ' . $httpCode);
            }

            $result = json_decode($response, true);
            
            if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
                return [
                    'success' => true,
                    'response' => $result['candidates'][0]['content']['parts'][0]['text']
                ];
            } else {
                throw new Exception('Invalid response format from Gemini API');
            }

        } catch (Exception $e) {
            error_log('Gemini API Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to get AI response. Please try again later.'
            ];
        }
    }
} 