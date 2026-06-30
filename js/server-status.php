<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    http_response_code(405);
    header('Allow: GET');
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

require_once __DIR__ . '/ServerInfoManager.php';

const CACHE_LIFETIME = 15;

$manager = ServerInfoManager::get();
$lastUpdate = $manager->getLastUpdate();
$isFresh = $manager->isValid()
    && $manager->getHostname() !== ''
    && $manager->getHostname() !== 'Offline'
    && $manager->getMaxPlayers() > 0
    && $lastUpdate > 0
    && (time() - $lastUpdate) < CACHE_LIFETIME;
$isOnline = $isFresh;

if (!$isFresh) {
    $lockPath = APP_ROOT . '/data/server_info.lock';
    $lockHandle = @fopen($lockPath, 'c');

    if ($lockHandle !== false && flock($lockHandle, LOCK_EX)) {
        $manager->reloadData();
        $lastUpdate = $manager->getLastUpdate();
        $isFresh = $manager->isValid()
            && $manager->getHostname() !== ''
            && $manager->getHostname() !== 'Offline'
            && $manager->getMaxPlayers() > 0
            && $lastUpdate > 0
            && (time() - $lastUpdate) < CACHE_LIFETIME;
        $isOnline = $isFresh || ServerInfoManager::update(SAMP_QUERY_HOST, SAMP_QUERY_PORT);
        flock($lockHandle, LOCK_UN);
        fclose($lockHandle);
    } else {
        $isOnline = ServerInfoManager::update(SAMP_QUERY_HOST, SAMP_QUERY_PORT);
    }
}

$manager->reloadData();

echo json_encode([
    'status' => $isOnline,
    'hostname' => $isOnline ? $manager->getHostname() : 'Offline',
    'players' => $isOnline ? $manager->getPlayers() : 0,
    'maxplayers' => $manager->getMaxPlayers(),
    'gamemode' => $manager->getGamemode(),
    'mapname' => $manager->getMapname(),
    'last_update' => $manager->getLastUpdate(),
    'server_ip' => SAMP_QUERY_HOST,
    'server_port' => SAMP_QUERY_PORT,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
