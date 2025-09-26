<?php
// --- Simple License Verification Endpoint ---
header('Content-Type: application/json');

// This file simulates checking a license against a central database.
// In a real application, this would connect to a database like MySQL.
$licenseFile = 'licenses.json';

function loadLicenses() {
    global $licenseFile;
    if (!file_exists($licenseFile)) {
        // Create a default empty license list if it doesn't exist
        file_put_contents($licenseFile, json_encode([]));
    }
    $content = file_get_contents($licenseFile);
    return json_decode($content, true);
}

// We only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['result' => 'error', 'message' => 'Method Not Allowed']);
    exit;
}

// Get the raw POST data
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

$licenseKey = trim($data['license'] ?? '');
$websiteId = trim($data['website_id'] ?? '');

if (empty($licenseKey) || empty($websiteId)) {
    echo json_encode(['result' => 2, 'message' => 'Missing license key or website ID.']);
    exit;
}

$licenses = loadLicenses();

// Check if the license key exists at all
if (!isset($licenses[$licenseKey])) {
    echo json_encode(['result' => 2, 'message' => 'Invalid license key.']);
    exit;
}

$licenseData = $licenses[$licenseKey];

// Check if the license is active
if (!$licenseData['active']) {
    echo json_encode(['result' => 3, 'message' => 'License has been deactivated.']);
    exit;
}

// Check if the license is already used by this website ID
if (in_array($websiteId, $licenseData['used_by'])) {
    echo json_encode(['result' => 1, 'message' => 'License verified successfully.']);
    exit;
}

// Check if the license has reached its max uses (assuming max 1 use for simplicity)
if (count($licenseData['used_by']) >= 1) {
    echo json_encode(['result' => 3, 'message' => 'License has reached maximum usage.']);
    exit;
}

// If we are here, the license is valid, active, and not used.
// We are not saving it here. The calling script will save it.
echo json_encode(['result' => 1, 'message' => 'License is valid and ready for activation.']);
?>
