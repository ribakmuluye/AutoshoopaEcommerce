<?php
// autoshoopa-backend/utils/Chapa.php

class Chapa {
    private static function getSecretKey() {
        return $_ENV['CHAPA_SECRET_KEY'] ?? getenv('CHAPA_SECRET_KEY') ?? 'CHASECK_TEST-dummySecretKey123456';
    }

    /**
     * Initializes a transaction with Chapa payment gateway
     */
    public static function initializePayment($data) {
        $url = 'https://api.chapa.co/v1/transaction/initialize';
        $key = self::getSecretKey();

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $key,
            'Content-Type: application/json'
        ]);

        $response = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);

        if ($err) {
            throw new Exception("Chapa Initialisation cURL Error: " . $err);
        }

        return json_decode($response, true);
    }

    /**
     * Verifies a transaction status with Chapa
     */
    public static function verifyPayment($txRef) {
        $url = 'https://api.chapa.co/v1/transaction/verify/' . $txRef;
        $key = self::getSecretKey();

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $key
        ]);

        $response = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);

        if ($err) {
            throw new Exception("Chapa Verification cURL Error: " . $err);
        }

        return json_decode($response, true);
    }
}
?>
