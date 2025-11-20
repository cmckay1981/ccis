<?php
/**
 * KA.BA.AKH Agent — Bootloader
 * Claymore & Colt Intelligence Suite (CCIS)
 * Loads The Higher Witness emotional clarity engine system prompt.
 */

header("Content-Type: application/json; charset=utf-8");

// ROOT PATH (adjust if needed)
$root = $_SERVER['DOCUMENT_ROOT'] . "/ccis/api/prompts/";

// LOAD MAIN KABAAKH PROMPT FILE
$kabaakh_file = $root . "kabaakh.txt";

if (!file_exists($kabaakh_file)) {
    $response = [
        "agent" => "KA.BA.AKH — The Higher Witness",
        "system_prompt" => "[ERROR] Missing kabaakh.txt at {$kabaakh_file}",
    ];
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

// READ KABAAKH SYSTEM PROMPT
$system_prompt = file_get_contents($kabaakh_file);

// FINAL SYSTEM PAYLOAD OUTPUT
$response = [
    "agent" => "KA.BA.AKH — The Higher Witness",
    "system_prompt" => trim($system_prompt),
];

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
exit;
?>
