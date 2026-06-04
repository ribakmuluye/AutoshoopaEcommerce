<?php
// autoshoopa-backend/config/database.php
// MongoDB connection with resilient fallback to local MongoDB

error_reporting(E_ALL);
ini_set('display_errors', 1);

// ── Load .env from project root ────────────────────────────────────────────
if (!function_exists('loadEnv')) {
    function loadEnv(string $path): void {
        if (!file_exists($path)) return;
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) continue;
            [$key, $val] = array_map('trim', explode('=', $line, 2));
            $val = trim($val, '"\'');
            if (!array_key_exists($key, $_ENV)) {
                $_ENV[$key] = $val;
                putenv("$key=$val");
            }
        }
    }
}

// Root .env is two directories above this file (project root)
loadEnv(__DIR__ . '/../../.env');

// Require autoloader (composer)
$autoloader = __DIR__ . '/../vendor/autoload.php';
if (!file_exists($autoloader)) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['error' => 'Composer autoloader not found. Run: composer install']);
    exit;
}
require_once $autoloader;

/**
 * Returns a MongoDB\Database instance (singleton-style).
 * Automatically falls back to local MongoDB if Atlas connection fails.
 */
function getMongoDB(): MongoDB\Database {
    static $db = null;
    if ($db !== null) return $db;

    $uri    = $_ENV['MONGODB_URI'] ?? getenv('MONGODB_URI') ?? '';
    $dbName = $_ENV['MONGODB_DB']  ?? getenv('MONGODB_DB')  ?? 'autoshoopa';

    // First try the configured Atlas URI
    if (!empty($uri)) {
        try {
            $client = new MongoDB\Client($uri);
            // Ping to verify authentication and connection
            $client->selectDatabase($dbName)->command(['ping' => 1]);
            $db = $client->selectDatabase($dbName);
            return $db;
        } catch (Exception $e) {
            // Log the error and fall back to local MongoDB
            error_log("MongoDB Atlas connection failed: " . $e->getMessage() . ". Falling back to local MongoDB.");
        }
    }

    // Fallback to local MongoDB
    try {
        $client = new MongoDB\Client("mongodb://localhost:27017");
        $client->selectDatabase($dbName)->command(['ping' => 1]);
        $db = $client->selectDatabase($dbName);
        return $db;
    } catch (Exception $localEx) {
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode([
            'error' => 'Database connection failed',
            'message' => 'Both Atlas and local MongoDB connection attempts failed.',
            'atlas_error' => isset($e) ? $e->getMessage() : 'No Atlas URI provided',
            'local_error' => $localEx->getMessage()
        ]);
        exit;
    }
}

/**
 * Returns a specific MongoDB collection.
 */
function getCollection(string $collection): MongoDB\Collection {
    return getMongoDB()->selectCollection($collection);
}

/**
 * Backward compatibility shim — returns the MongoDB database.
 */
function getConnection(): MongoDB\Database {
    return getMongoDB();
}

/**
 * Formats a MongoDB document / array to be JSON-serializable.
 * Converts ObjectIDs to 'id' strings and UTCDateTimes to 'Y-m-d H:i:s' strings.
 */
function formatMongoDoc($doc) {
    if (!$doc) return null;
    
    // Convert objects/BSON documents to arrays
    if ($doc instanceof MongoDB\Model\BSONDocument) {
        $doc = $doc->getArrayCopy();
    } elseif (is_object($doc)) {
        $doc = (array) $doc;
    }
    
    if (isset($doc['_id'])) {
        $doc['id'] = (string) $doc['_id'];
        unset($doc['_id']);
    }

    foreach ($doc as $key => $val) {
        if ($val instanceof MongoDB\BSON\ObjectId) {
            $doc[$key] = (string) $val;
        } elseif ($val instanceof MongoDB\BSON\UTCDateTime) {
            $doc[$key] = $val->toDateTime()->setTimezone(new DateTimeZone(date_default_timezone_get()))->format('Y-m-d H:i:s');
        } elseif ($val instanceof MongoDB\Model\BSONDocument || $val instanceof MongoDB\Model\BSONArray) {
            $doc[$key] = formatMongoDoc($val);
        } elseif (is_array($val) || is_object($val)) {
            $doc[$key] = formatMongoDoc($val);
        }
    }
    return $doc;
}

/**
 * Compatibility class Database so existing objects/controllers can do
 * $database = new Database();
 * $db = $database->getConnection();
 */
class Database {
    public function getConnection() {
        return getMongoDB();
    }
}
?>