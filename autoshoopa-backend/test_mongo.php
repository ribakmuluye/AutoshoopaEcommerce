<?php
require __DIR__ . '/config/database.php';

try {
    echo "Attempting to connect using your .env configuration...\n";
    $db = getMongoDB();
    
    echo "✅ Success! Connected to database: " . $db->getDatabaseName() . "\n\n";
    
    echo "Collections found in this database:\n";
    $collections = $db->listCollections();
    $count = 0;
    foreach ($collections as $collection) {
        echo "- " . $collection->getName() . "\n";
        $count++;
    }
    
    if ($count === 0) {
        echo "The database is empty (no collections yet). Go register a user on the website to create the first collection!\n";
    }
} catch (Exception $e) {
    echo "❌ Connection Error: " . $e->getMessage() . "\n";
}
