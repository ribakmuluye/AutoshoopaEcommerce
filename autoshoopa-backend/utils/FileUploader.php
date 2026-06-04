<?php
class FileUploader {
    private $upload_dir;
    private $allowed_types;
    private $max_size;
    private $max_dimension;
    private $quality;

    public function __construct(
        $upload_dir = '../uploads/products',
        $allowed_types = ['image/jpeg', 'image/png', 'image/webp'],
        $max_size = 5242880, // 5MB
        $max_dimension = 1200,
        $quality = 85
    ) {
        $this->upload_dir = $upload_dir;
        $this->allowed_types = $allowed_types;
        $this->max_size = $max_size;
        $this->max_dimension = $max_dimension;
        $this->quality = $quality;

        // Create upload directory if it doesn't exist
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
    }

    public function upload($file) {
        // Validate file
        if (!isset($file['error']) || is_array($file['error'])) {
            throw new Exception('Invalid file parameter');
        }

        // Check for upload errors
        switch ($file['error']) {
            case UPLOAD_ERR_OK:
                break;
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                throw new Exception('File size exceeds limit');
            case UPLOAD_ERR_PARTIAL:
                throw new Exception('File was only partially uploaded');
            case UPLOAD_ERR_NO_FILE:
                throw new Exception('No file was uploaded');
            default:
                throw new Exception('Unknown upload error');
        }

        // Check file size
        if ($file['size'] > $this->max_size) {
            throw new Exception('File size exceeds limit');
        }

        // Check file type
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $file_type = $finfo->file($file['tmp_name']);
        if (!in_array($file_type, $this->allowed_types)) {
            throw new Exception('Invalid file type');
        }

        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid() . '.' . $extension;
        $filepath = $this->upload_dir . '/' . $filename;

        // Optimize and resize image
        $this->optimizeImage($file['tmp_name'], $filepath, $file_type);

        // Return relative path
        return 'uploads/products/' . $filename;
    }

    private function optimizeImage($source_path, $target_path, $mime_type) {
        list($width, $height) = getimagesize($source_path);
        
        // Calculate new dimensions while maintaining aspect ratio
        if ($width > $this->max_dimension || $height > $this->max_dimension) {
            if ($width > $height) {
                $new_width = $this->max_dimension;
                $new_height = floor($height * ($this->max_dimension / $width));
            } else {
                $new_height = $this->max_dimension;
                $new_width = floor($width * ($this->max_dimension / $height));
            }
        } else {
            $new_width = $width;
            $new_height = $height;
        }

        // Create new image
        $new_image = imagecreatetruecolor($new_width, $new_height);

        // Handle transparency for PNG
        if ($mime_type === 'image/png') {
            imagealphablending($new_image, false);
            imagesavealpha($new_image, true);
            $transparent = imagecolorallocatealpha($new_image, 255, 255, 255, 127);
            imagefilledrectangle($new_image, 0, 0, $new_width, $new_height, $transparent);
        }

        // Load source image
        switch ($mime_type) {
            case 'image/jpeg':
                $source = imagecreatefromjpeg($source_path);
                break;
            case 'image/png':
                $source = imagecreatefrompng($source_path);
                break;
            case 'image/webp':
                $source = imagecreatefromwebp($source_path);
                break;
            default:
                throw new Exception('Unsupported image type');
        }

        // Resize image
        imagecopyresampled(
            $new_image, $source,
            0, 0, 0, 0,
            $new_width, $new_height,
            $width, $height
        );

        // Save optimized image
        switch ($mime_type) {
            case 'image/jpeg':
                imagejpeg($new_image, $target_path, $this->quality);
                break;
            case 'image/png':
                imagepng($new_image, $target_path, round(9 * $this->quality / 100));
                break;
            case 'image/webp':
                imagewebp($new_image, $target_path, $this->quality);
                break;
        }

        // Clean up
        imagedestroy($source);
        imagedestroy($new_image);
    }

    public function delete($filepath) {
        $full_path = $this->upload_dir . '/' . basename($filepath);
        if (file_exists($full_path)) {
            unlink($full_path);
            return true;
        }
        return false;
    }

    public function uploadMultiple($files) {
        $uploaded_files = [];
        foreach ($files as $file) {
            try {
                $uploaded_files[] = $this->upload($file);
            } catch (Exception $e) {
                // Log error but continue with other files
                error_log("Error uploading file: " . $e->getMessage());
            }
        }
        return $uploaded_files;
    }
} 