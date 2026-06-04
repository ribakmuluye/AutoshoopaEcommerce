<?php
// autoshoopa-backend/objects/user.php
// MongoDB-compatible User model

class User {
    private $conn; // Remains for compatibility but represents MongoDB\Database or is ignored
    private $collection;

    public $id;
    public $name;
    public $email;
    public $password;
    public $phone;
    public $user_type;
    public $business_name;
    public $business_address;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
        $this->collection = getCollection('users');
    }

    /**
     * Create a user document in MongoDB.
     */
    public function create() {
        // Sanitize input
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->user_type = htmlspecialchars(strip_tags($this->user_type));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->business_name = htmlspecialchars(strip_tags($this->business_name));
        $this->business_address = htmlspecialchars(strip_tags($this->business_address));

        // Hashing password
        $hashed_password = password_hash($this->password, PASSWORD_DEFAULT);

        // Document fields
        $document = [
            'name' => $this->name,
            'email' => $this->email,
            'password' => $hashed_password,
            'user_type' => $this->user_type,
            'phone' => $this->phone,
            'created_at' => new MongoDB\BSON\UTCDateTime()
        ];

        // Store seller details in the user document if seller
        if ($this->user_type === 'seller') {
            $document['business_name'] = $this->business_name;
            $document['business_address'] = $this->business_address;
        }

        try {
            $result = $this->collection->insertOne($document);
            if ($result->getInsertedCount() > 0) {
                $this->id = (string) $result->getInsertedId();
                return true;
            }
        } catch (Exception $e) {
            error_log("Error creating user: " . $e->getMessage());
        }

        return false;
    }

    /**
     * Authenticate user from MongoDB database.
     */
    public function login() {
        $this->email = htmlspecialchars(strip_tags($this->email));

        try {
            $userDoc = $this->collection->findOne(['email' => $this->email]);
            if ($userDoc) {
                // Verify password
                if (password_verify($this->password, $userDoc['password'])) {
                    $this->id = (string) $userDoc['_id'];
                    $this->name = $userDoc['name'];
                    $this->email = $userDoc['email'];
                    $this->user_type = $userDoc['user_type'];
                    $this->phone = $userDoc['phone'] ?? '';
                    
                    // Seller details (optional fields)
                    $this->business_name = $userDoc['business_name'] ?? '';
                    $this->business_address = $userDoc['business_address'] ?? '';
                    
                    return true;
                }
            }
        } catch (Exception $e) {
            error_log("Error logging in: " . $e->getMessage());
        }

        return false;
    }

    /**
     * Check if email already exists in MongoDB users collection.
     */
    public function emailExists() {
        $this->email = htmlspecialchars(strip_tags($this->email));

        try {
            $count = $this->collection->countDocuments(['email' => $this->email]);
            return $count > 0;
        } catch (Exception $e) {
            error_log("Error checking email exists: " . $e->getMessage());
        }

        return false;
    }
}
?>