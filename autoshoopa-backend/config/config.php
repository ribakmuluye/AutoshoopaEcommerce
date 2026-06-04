<?php
// Gemini AI API Configuration
// Get your API key from: https://console.cloud.google.com/
// 1. Create a new project or select existing one
// 2. Enable Gemini API in API Library
// 3. Create credentials (API key)
// 4. Replace the value below with your API key
define('GEMINI_API_KEY', 'YOUR_GEMINI_API_KEY_HERE');

// Security: Make sure this file is not accessible from the web
// Add this to your .htaccess file:
// <Files "config.php">
//     Order Allow,Deny
//     Deny from all
// </Files>

// Other configuration constants can be added here 