<?php
/**
 * EmailService — Central SMTP email service for AutoShoopa
 * Uses PHPMailer with Gmail SMTP to send real emails.
 * Falls back to database logging if SMTP is not configured.
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../config/database.php';

class EmailService {
    private $mailer;
    private $db;
    private $isConfigured = false;
    private $fromEmail;
    private $fromName;

    public function __construct() {
        $this->db = getMongoDB();
        $this->fromEmail = $_ENV['SMTP_EMAIL'] ?? getenv('SMTP_EMAIL') ?? '';
        $this->fromName  = $_ENV['SMTP_FROM_NAME'] ?? getenv('SMTP_FROM_NAME') ?? 'AutoShoopa';
        $smtpPassword    = $_ENV['SMTP_PASSWORD'] ?? getenv('SMTP_PASSWORD') ?? '';
        $smtpHost        = $_ENV['SMTP_HOST'] ?? getenv('SMTP_HOST') ?? 'smtp.gmail.com';
        $smtpPort        = (int)($_ENV['SMTP_PORT'] ?? getenv('SMTP_PORT') ?? 587);

        // Check if SMTP is properly configured (password is not placeholder)
        if (!empty($this->fromEmail) && !empty($smtpPassword) && $smtpPassword !== 'YOUR_APP_PASSWORD_HERE') {
            try {
                $this->mailer = new PHPMailer(true);
                $this->mailer->isSMTP();
                $this->mailer->Host       = $smtpHost;
                $this->mailer->SMTPAuth   = true;
                $this->mailer->Username   = $this->fromEmail;
                $this->mailer->Password   = $smtpPassword;
                $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                $this->mailer->Port       = $smtpPort;
                $this->mailer->CharSet    = 'UTF-8';
                $this->mailer->isHTML(true);

                // Set default sender
                $this->mailer->setFrom($this->fromEmail, $this->fromName);

                $this->isConfigured = true;
            } catch (Exception $e) {
                error_log("EmailService: PHPMailer initialization failed: " . $e->getMessage());
                $this->isConfigured = false;
            }
        } else {
            error_log("EmailService: SMTP not configured. Emails will be logged to database only.");
        }
    }

    /**
     * Check if SMTP is configured and ready to send.
     */
    public function isReady(): bool {
        return $this->isConfigured;
    }

    /**
     * Send a contact form email to the site owner.
     */
    public function sendContactEmail(array $data): array {
        $to      = $this->fromEmail ?: 'rebekamuluye@gmail.com';
        $subject = 'Contact Form: ' . ($data['subject'] ?? 'No Subject');
        $html    = $this->buildContactEmailTemplate($data);

        // Always log to database
        $this->logToDatabase('contact', $to, $subject, $data);

        // Attempt SMTP send
        if ($this->isConfigured) {
            try {
                $this->resetMailer();
                $this->mailer->addAddress($to);
                $this->mailer->addReplyTo($data['email'], $data['name']);
                $this->mailer->Subject = $subject;
                $this->mailer->Body    = $html;
                $this->mailer->AltBody = $this->buildContactTextEmail($data);
                $this->mailer->send();

                return [
                    'sent' => true,
                    'method' => 'smtp',
                    'message' => 'Email sent successfully via Gmail SMTP'
                ];
            } catch (Exception $e) {
                error_log("EmailService: Contact email SMTP failed: " . $e->getMessage());
                return [
                    'sent' => false,
                    'method' => 'database_only',
                    'message' => 'SMTP send failed. Message logged to database.',
                    'error' => $e->getMessage()
                ];
            }
        }

        return [
            'sent' => false,
            'method' => 'database_only',
            'message' => 'SMTP not configured. Message logged to database. Add your Gmail App Password to .env to enable email delivery.'
        ];
    }

    /**
     * Send an order confirmation email to the customer.
     */
    public function sendOrderConfirmation(string $customerEmail, string $customerName, string $orderId, float $total, array $items = []): array {
        $subject = "Order Confirmed — #{$orderId}";
        $html    = $this->buildOrderConfirmationTemplate($customerName, $orderId, $total, $items);

        $data = [
            'customer_email' => $customerEmail,
            'customer_name'  => $customerName,
            'order_id'       => $orderId,
            'total'          => $total,
            'items'          => $items
        ];

        $this->logToDatabase('order_confirmation', $customerEmail, $subject, $data);

        if ($this->isConfigured) {
            try {
                $this->resetMailer();
                $this->mailer->addAddress($customerEmail, $customerName);
                $this->mailer->Subject = $subject;
                $this->mailer->Body    = $html;
                $this->mailer->AltBody = "Hi {$customerName}, your order #{$orderId} has been confirmed. Total: ETB " . number_format($total, 2);
                $this->mailer->send();

                return ['sent' => true, 'method' => 'smtp'];
            } catch (Exception $e) {
                error_log("EmailService: Order confirmation SMTP failed: " . $e->getMessage());
                return ['sent' => false, 'method' => 'database_only', 'error' => $e->getMessage()];
            }
        }

        return ['sent' => false, 'method' => 'database_only'];
    }

    /**
     * Send an order status update email to the customer.
     */
    public function sendOrderStatusUpdate(string $customerEmail, string $customerName, string $orderId, string $status): array {
        $statusLabels = [
            'pending'    => 'Received',
            'processing' => 'Processing',
            'shipped'    => 'Shipped',
            'delivered'  => 'Delivered',
            'cancelled'  => 'Cancelled',
        ];
        $statusLabel = $statusLabels[$status] ?? ucfirst($status);
        $subject     = "Order #{$orderId} — {$statusLabel}";
        $html        = $this->buildOrderStatusTemplate($customerName, $orderId, $status, $statusLabel);

        $data = [
            'customer_email' => $customerEmail,
            'customer_name'  => $customerName,
            'order_id'       => $orderId,
            'status'         => $status
        ];

        $this->logToDatabase('order_status', $customerEmail, $subject, $data);

        if ($this->isConfigured) {
            try {
                $this->resetMailer();
                $this->mailer->addAddress($customerEmail, $customerName);
                $this->mailer->Subject = $subject;
                $this->mailer->Body    = $html;
                $this->mailer->AltBody = "Hi {$customerName}, your order #{$orderId} status has been updated to: {$statusLabel}.";
                $this->mailer->send();

                return ['sent' => true, 'method' => 'smtp'];
            } catch (Exception $e) {
                error_log("EmailService: Order status SMTP failed: " . $e->getMessage());
                return ['sent' => false, 'method' => 'database_only', 'error' => $e->getMessage()];
            }
        }

        return ['sent' => false, 'method' => 'database_only'];
    }

    /**
     * Send a generic email (for flexible usage).
     */
    public function sendGenericEmail(string $to, string $subject, string $htmlBody, string $textBody = ''): array {
        $this->logToDatabase('generic', $to, $subject, ['html' => $htmlBody]);

        if ($this->isConfigured) {
            try {
                $this->resetMailer();
                $this->mailer->addAddress($to);
                $this->mailer->Subject = $subject;
                $this->mailer->Body    = $htmlBody;
                $this->mailer->AltBody = $textBody ?: strip_tags($htmlBody);
                $this->mailer->send();

                return ['sent' => true, 'method' => 'smtp'];
            } catch (Exception $e) {
                error_log("EmailService: Generic email SMTP failed: " . $e->getMessage());
                return ['sent' => false, 'method' => 'database_only', 'error' => $e->getMessage()];
            }
        }

        return ['sent' => false, 'method' => 'database_only'];
    }

    // ──────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────

    /**
     * Reset PHPMailer state between sends.
     */
    private function resetMailer(): void {
        if ($this->mailer) {
            $this->mailer->clearAddresses();
            $this->mailer->clearReplyTos();
            $this->mailer->clearAttachments();
            $this->mailer->setFrom($this->fromEmail, $this->fromName);
        }
    }

    /**
     * Log every email attempt to MongoDB for audit / fallback.
     */
    private function logToDatabase(string $type, string $to, string $subject, array $data): void {
        try {
            $collection = $this->db->selectCollection('email_log');
            $collection->insertOne([
                'type'       => $type,
                'to'         => $to,
                'subject'    => $subject,
                'data'       => $data,
                'smtp_configured' => $this->isConfigured,
                'created_at' => new \MongoDB\BSON\UTCDateTime(),
            ]);
        } catch (\Exception $e) {
            error_log("EmailService: Failed to log email to database: " . $e->getMessage());
        }
    }

    // ──────────────────────────────────────────────────────────────
    // HTML Email Templates
    // ──────────────────────────────────────────────────────────────

    private function baseEmailWrapper(string $title, string $content): string {
        return '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>' . htmlspecialchars($title) . '</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:30px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#0b0f19 0%,#1a1f2e 100%);padding:28px 32px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">
                                <span style="color:#f97316;">Auto</span>Shoopa
                            </h1>
                            <p style="margin:6px 0 0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:2px;">
                                ' . htmlspecialchars($title) . '
                            </p>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:32px;">
                            ' . $content . '
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;text-align:center;">
                            <p style="margin:0;color:#94a3b8;font-size:11px;">
                                &copy; ' . date('Y') . ' AutoShoopa &mdash; Your Trusted Auto Parts Marketplace
                            </p>
                            <p style="margin:4px 0 0;color:#cbd5e1;font-size:10px;">
                                Bole, Addis Ababa, Ethiopia
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>';
    }

    private function buildContactEmailTemplate(array $data): string {
        $content = '
            <h2 style="margin:0 0 20px;color:#1e293b;font-size:20px;font-weight:700;">New Contact Form Message</h2>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                    <td style="padding:12px 16px;background:#f8fafc;border-left:4px solid #f97316;border-radius:0 8px 8px 0;margin-bottom:8px;">
                        <span style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">From</span><br>
                        <span style="color:#1e293b;font-size:15px;font-weight:600;">' . htmlspecialchars($data['name']) . '</span>
                    </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                    <td style="padding:12px 16px;background:#f8fafc;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;">
                        <span style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Email</span><br>
                        <a href="mailto:' . htmlspecialchars($data['email']) . '" style="color:#3b82f6;font-size:15px;text-decoration:none;">' . htmlspecialchars($data['email']) . '</a>
                    </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                    <td style="padding:12px 16px;background:#f8fafc;border-left:4px solid #10b981;border-radius:0 8px 8px 0;">
                        <span style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Subject</span><br>
                        <span style="color:#1e293b;font-size:15px;font-weight:600;">' . htmlspecialchars($data['subject']) . '</span>
                    </td>
                </tr>
            </table>

            <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:16px 20px;margin-bottom:16px;">
                <span style="color:#92400e;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Message</span>
                <p style="margin:8px 0 0;color:#1e293b;font-size:14px;line-height:1.7;">' . nl2br(htmlspecialchars($data['message'])) . '</p>
            </div>

            <p style="color:#94a3b8;font-size:12px;margin:16px 0 0;">
                Sent on ' . date('F j, Y \a\t g:i A') . ' &bull; You can reply directly to this email to respond.
            </p>';

        return $this->baseEmailWrapper('New Contact Message', $content);
    }

    private function buildContactTextEmail(array $data): string {
        return "New Contact Form Submission\n"
             . "AutoShoopa Website\n"
             . "========================\n\n"
             . "Name: " . $data['name'] . "\n"
             . "Email: " . $data['email'] . "\n"
             . "Subject: " . $data['subject'] . "\n"
             . "Message:\n" . $data['message'] . "\n\n"
             . "Sent on: " . date('Y-m-d H:i:s') . "\n"
             . "You can reply directly to this email to respond to the sender.";
    }

    private function buildOrderConfirmationTemplate(string $name, string $orderId, float $total, array $items): string {
        $itemsHtml = '';
        if (!empty($items)) {
            $itemsHtml .= '<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">';
            $itemsHtml .= '<tr style="background:#f8fafc;"><th style="padding:10px 14px;text-align:left;color:#64748b;font-size:12px;text-transform:uppercase;">Item</th><th style="padding:10px 14px;text-align:center;color:#64748b;font-size:12px;">Qty</th><th style="padding:10px 14px;text-align:right;color:#64748b;font-size:12px;">Price</th></tr>';
            foreach ($items as $item) {
                $itemName  = htmlspecialchars($item['name'] ?? 'Product');
                $itemQty   = (int)($item['quantity'] ?? 1);
                $itemPrice = number_format((float)($item['price'] ?? 0), 2);
                $itemsHtml .= '<tr style="border-top:1px solid #f1f5f9;"><td style="padding:10px 14px;color:#1e293b;font-size:14px;">' . $itemName . '</td><td style="padding:10px 14px;text-align:center;color:#475569;font-size:14px;">' . $itemQty . '</td><td style="padding:10px 14px;text-align:right;color:#1e293b;font-size:14px;font-weight:600;">ETB ' . $itemPrice . '</td></tr>';
            }
            $itemsHtml .= '</table>';
        }

        $content = '
            <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;">Order Confirmed! ✅</h2>
            <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Hi ' . htmlspecialchars($name) . ', thank you for your order.</p>

            <div style="background:linear-gradient(135deg,#0b0f19,#1a1f2e);border-radius:10px;padding:20px 24px;margin-bottom:20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <span style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Order ID</span><br>
                            <span style="color:#ffffff;font-size:18px;font-weight:700;">#' . htmlspecialchars($orderId) . '</span>
                        </td>
                        <td style="text-align:right;">
                            <span style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Total</span><br>
                            <span style="color:#f97316;font-size:22px;font-weight:800;">ETB ' . number_format($total, 2) . '</span>
                        </td>
                    </tr>
                </table>
            </div>

            ' . $itemsHtml . '

            <p style="color:#64748b;font-size:13px;line-height:1.6;margin:16px 0 0;">
                We\'ll notify you when your order ships. If you have any questions, reply to this email or visit our <strong>Contact</strong> page.
            </p>';

        return $this->baseEmailWrapper('Order Confirmation', $content);
    }

    private function buildOrderStatusTemplate(string $name, string $orderId, string $status, string $statusLabel): string {
        $statusColors = [
            'pending'    => '#eab308',
            'processing' => '#3b82f6',
            'shipped'    => '#8b5cf6',
            'delivered'  => '#10b981',
            'cancelled'  => '#ef4444',
        ];
        $color = $statusColors[$status] ?? '#64748b';

        $statusMessages = [
            'pending'    => 'Your order has been received and is being reviewed by the seller.',
            'processing' => 'Great news! The seller is now preparing your order.',
            'shipped'    => 'Your order is on its way! It has been shipped and is en route to your address.',
            'delivered'  => 'Your order has been delivered successfully. We hope you enjoy your purchase!',
            'cancelled'  => 'Your order has been cancelled. If this was a mistake, please contact us immediately.',
        ];
        $statusMsg = $statusMessages[$status] ?? "Your order status has been updated to: {$statusLabel}.";

        $content = '
            <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;">Order Status Update</h2>
            <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Hi ' . htmlspecialchars($name) . ', here\'s an update on your order.</p>

            <div style="text-align:center;margin-bottom:24px;">
                <span style="display:inline-block;background:' . $color . ';color:#ffffff;font-size:13px;font-weight:700;padding:8px 24px;border-radius:30px;text-transform:uppercase;letter-spacing:1px;">
                    ' . htmlspecialchars($statusLabel) . '
                </span>
            </div>

            <div style="background:#f8fafc;border-radius:10px;padding:20px 24px;border:1px solid #e2e8f0;margin-bottom:20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <span style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Order ID</span><br>
                            <span style="color:#1e293b;font-size:16px;font-weight:700;">#' . htmlspecialchars($orderId) . '</span>
                        </td>
                        <td style="text-align:right;">
                            <span style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Updated</span><br>
                            <span style="color:#475569;font-size:14px;">' . date('M j, Y g:i A') . '</span>
                        </td>
                    </tr>
                </table>
            </div>

            <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 16px;">' . $statusMsg . '</p>

            <p style="color:#94a3b8;font-size:12px;margin:16px 0 0;">
                Questions? Reply to this email or visit our Contact page.
            </p>';

        return $this->baseEmailWrapper('Order Update', $content);
    }
}
?>
