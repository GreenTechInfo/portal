<?php

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/SampQueryAPI.php';

/**
 * Класс для работы с информацией о SA:MP сервере
 * 
 * Реализует Singleton паттерн для обеспечения единственного экземпляра в рамках одного PHP-FPM процесса.
 * 
 * @version 1.0
 * @author Artem Smirnov <outsource.dev.tema@smirnov.one> (https://t.me/temasm)
 */
class ServerInfoManager
{
    /**
     * Константы по умолчанию
     */
    private const DEFAULT_SERVER_IP = SAMP_QUERY_HOST;
    private const DEFAULT_SERVER_PORT = SAMP_QUERY_PORT;
    private const DEFAULT_JSON_FILE = SAMP_SERVER_INFO_FILE;
    private const PEAK_ONLINE_FILE = APP_ROOT . '/data/peak_online.json';
    
    /**
     * @var ServerInfoManager|null Единственный экземпляр класса (Singleton)
     */
    private static $instance = null;
    
    /**
     * @var array|null Данные о сервере
     */
    private $data = null;
    
    /**
     * @var string Путь к JSON файлу с данными
     */
    private $jsonFile;
    
    /**
     * Конструктор
     * 
     * @param string|null $jsonFile Путь к JSON файлу (по умолчанию используется стандартный путь)
     */
    public function __construct($jsonFile = null)
    {
        $this->jsonFile = $jsonFile ?: self::DEFAULT_JSON_FILE;
        $this->loadData();
    }
    
    /**
     * Загружает данные из JSON файла
     * 
     * @return bool Успешность загрузки
     */
    private function loadData()
    {
        try {
            if (!file_exists($this->jsonFile)) {
                // Создаем пустой файл если он не существует
                $this->createEmptyServerInfoFile();
                $this->data = null;
                return false;
            }
            
            $jsonData = file_get_contents($this->jsonFile);
            if ($jsonData === false) {
                error_log("Не удалось прочитать файл информации о сервере: " . $this->jsonFile);
                $this->data = null;
                return false;
            }
            
            $this->data = json_decode($jsonData, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                error_log("Ошибка при декодировании JSON информации о сервере: " . json_last_error_msg());
                // Пересоздаем файл если JSON поврежден
                $this->createEmptyServerInfoFile();
                $this->data = null;
                return false;
            }
            
            return $this->data !== null && is_array($this->data);
        } catch (Exception $e) {
            error_log("Ошибка при загрузке данных о сервере: " . $e->getMessage());
            $this->data = null;
            return false;
        }
    }
    
    /**
     * Создает пустой файл информации о сервере
     * 
     * @return bool Успешность создания
     */
    private function createEmptyServerInfoFile()
    {
        try {
            if (!is_dir(dirname($this->jsonFile))) {
                mkdir(dirname($this->jsonFile), 0755, true);
            }
            
            $emptyData = [
                'password' => 0,
                'players' => 0,
                'maxplayers' => 0,
                'hostname' => 'Offline',
                'gamemode' => '',
                'mapname' => '',
                'detailed_players' => [],
                'last_update' => time(),
                'server_ip' => SAMP_QUERY_HOST,
                'server_port' => SAMP_QUERY_PORT
            ];
            
            $jsonData = json_encode($emptyData, JSON_UNESCAPED_UNICODE);
            return file_put_contents($this->jsonFile, $jsonData) !== false;
        } catch (Exception $e) {
            error_log("Ошибка при создании файла информации о сервере: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Проверяет, загружены ли данные
     * 
     * @return bool
     */
    public function isValid()
    {
        return $this->data !== null && is_array($this->data);
    }
    
    /**
     * Получает количество игроков на сервере
     * 
     * @return int Количество игроков или 0 при ошибке
     */
    public function getPlayers()
    {
        return $this->data['players'] ?? 0;
    }
    
    /**
     * Получает максимальное количество игроков на сервере
     * 
     * @return int Максимальное количество игроков или 0 при ошибке
     */
    public function getMaxPlayers()
    {
        return $this->data['maxplayers'] ?? 0;
    }
    
    /**
     * Получает название сервера
     * 
     * @return string Название сервера или пустая строка при ошибке
     */
    public function getHostname()
    {
        return $this->data['hostname'] ?? '';
    }
    
    /**
     * Получает режим игры
     * 
     * @return string Режим игры или пустая строка при ошибке
     */
    public function getGamemode()
    {
        return $this->data['gamemode'] ?? '';
    }
    
    /**
     * Получает название карты
     * 
     * @return string Название карты или пустая строка при ошибке
     */
    public function getMapname()
    {
        return $this->data['mapname'] ?? '';
    }
    
    /**
     * Проверяет, защищен ли сервер паролем
     * 
     * @return bool True если сервер защищен паролем
     */
    public function isPassworded()
    {
        return ($this->data['password'] ?? 0) === 1;
    }
    
    /**
     * Получает детальную информацию об игроках на сервере
     * 
     * @return array Массив с информацией об игроках или пустой массив при ошибке
     */
    public function getDetailedPlayers()
    {
        return $this->data['detailed_players'] ?? [];
    }
    
    /**
     * Получает время последнего обновления данных
     * 
     * @return int Timestamp последнего обновления или 0 при ошибке
     */
    public function getLastUpdate()
    {
        return $this->data['last_update'] ?? 0;
    }
    
    /**
     * Получает IP адрес сервера
     * 
     * @return string IP адрес сервера или пустая строка при ошибке
     */
    public function getServerIp()
    {
        return $this->data['server_ip'] ?? '';
    }
    
    /**
     * Получает порт сервера
     * 
     * @return string Порт сервера или пустая строка при ошибке
     */
    public function getServerPort()
    {
        return $this->data['server_port'] ?? '';
    }
    
    /**
     * Получает полную информацию о сервере
     * 
     * @return array|null Массив с информацией о сервере или null при ошибке
     */
    public function getAllData()
    {
        return $this->data;
    }
    
    /**
     * Получает процент заполненности сервера
     * 
     * @return float Процент заполненности (0-100) или 0 при ошибке
     */
    public function getFillPercentage()
    {
        $players = $this->getPlayers();
        $maxPlayers = $this->getMaxPlayers();
        
        if ($maxPlayers <= 0) {
            return 0;
        }
        
        return round(($players / $maxPlayers) * 100, 2);
    }
    
    /**
     * Получает форматированную строку онлайна
     * 
     * @return string Строка вида "25/200" или "0/0" при ошибке
     */
    public function getOnlineString()
    {
        return $this->getPlayers() . '/' . $this->getMaxPlayers();
    }
    
    /**
     * Получает время последнего обновления в читаемом формате
     * 
     * @param string $format Формат даты (по умолчанию 'Y-m-d H:i:s')
     * @return string Отформатированная дата или пустая строка при ошибке
     */
    public function getLastUpdateFormatted($format = 'Y-m-d H:i:s')
    {
        $timestamp = $this->getLastUpdate();
        return $timestamp > 0 ? date($format, $timestamp) : '';
    }
    
    /**
     * Получает пиковый онлайн за сегодня
     * 
     * @return int Пиковый онлайн или 0 при ошибке
     */
    public function getPeakOnline()
    {
        try {
            $peakData = self::loadPeakData();
            $today = date('Y-m-d');
            
            return $peakData[$today] ?? 0;
        } catch (Exception $e) {
            error_log("Ошибка при получении пикового онлайна: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Получает пиковый онлайн за все время
     * 
     * @return int Максимальный пиковый онлайн или 0 при ошибке
     */
    public function getMaxPeakOnline()
    {
        try {
            $peakData = self::loadPeakData();
            
            if (empty($peakData)) {
                return 0;
            }
            
            return max(array_values($peakData));
        } catch (Exception $e) {
            error_log("Ошибка при получении максимального пикового онлайна: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Загружает данные о пиковом онлайне
     * 
     * @return array Массив с данными о пиковом онлайне по дням
     */
    private static function loadPeakData()
    {
        try {
            if (!file_exists(self::PEAK_ONLINE_FILE)) {
                // Создаем пустой файл если он не существует
                self::createEmptyPeakFile();
                return [];
            }
            
            $jsonData = file_get_contents(self::PEAK_ONLINE_FILE);
            if ($jsonData === false) {
                error_log("Не удалось прочитать файл пикового онлайна: " . self::PEAK_ONLINE_FILE);
                return [];
            }
            
            $data = json_decode($jsonData, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                error_log("Ошибка при декодировании JSON пикового онлайна: " . json_last_error_msg());
                // Пересоздаем файл если JSON поврежден
                self::createEmptyPeakFile();
                return [];
            }
            
            return is_array($data) ? $data : [];
        } catch (Exception $e) {
            error_log("Ошибка при загрузке данных пикового онлайна: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Создает пустой файл пикового онлайна
     * 
     * @return bool Успешность создания
     */
    private static function createEmptyPeakFile()
    {
        try {
            if (!is_dir(dirname(self::PEAK_ONLINE_FILE))) {
                mkdir(dirname(self::PEAK_ONLINE_FILE), 0755, true);
            }
            
            $emptyData = json_encode([], JSON_UNESCAPED_UNICODE);
            return file_put_contents(self::PEAK_ONLINE_FILE, $emptyData) !== false;
        } catch (Exception $e) {
            error_log("Ошибка при создании файла пикового онлайна: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Обновляет пиковый онлайн для текущего дня
     * 
     * @param int $currentOnline Текущий онлайн
     * @return bool Успешность обновления
     */
    private static function updatePeakOnline($currentOnline)
    {
        try {
            $peakData = self::loadPeakData();
            $today = date('Y-m-d');
            
            // Если текущий онлайн больше пика за сегодня, обновляем
            if ($currentOnline > ($peakData[$today] ?? 0)) {
                $peakData[$today] = $currentOnline;
                
                // Ограничиваем историю 30 днями
                $thirtyDaysAgo = date('Y-m-d', strtotime('-30 days'));
                foreach ($peakData as $date => $peak) {
                    if ($date < $thirtyDaysAgo) {
                        unset($peakData[$date]);
                    }
                }
                
                $jsonData = json_encode($peakData, JSON_UNESCAPED_UNICODE);
                if ($jsonData === false) {
                    error_log("Ошибка при кодировании JSON пикового онлайна: " . json_last_error_msg());
                    return false;
                }
                
                if (!is_dir(dirname(self::PEAK_ONLINE_FILE))) {
                    if (!mkdir(dirname(self::PEAK_ONLINE_FILE), 0755, true)) {
                        error_log("Не удалось создать директорию для файла пикового онлайна: " . dirname(self::PEAK_ONLINE_FILE));
                        return false;
                    }
                }
                
                if (file_put_contents(self::PEAK_ONLINE_FILE, $jsonData) === false) {
                    error_log("Не удалось записать файл пикового онлайна: " . self::PEAK_ONLINE_FILE);
                    return false;
                }
            }
            
            return true;
        } catch (Exception $e) {
            error_log("Ошибка при обновлении пикового онлайна: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Получает единственный экземпляр класса (Singleton)
     * 
     * @param string|null $jsonFile Путь к JSON файлу (используется только при первом создании)
     * @return ServerInfoManager
     */
    public static function get($jsonFile = null)
    {
        if (self::$instance === null) {
            self::$instance = new self($jsonFile);
        }
        return self::$instance;
    }
    
    /**
     * Перезагружает данные из JSON файла
     * 
     * @return bool Успешность перезагрузки
     */
    public function reloadData()
    {
        return $this->loadData();
    }
    
    /**
     * Обновляет данные о сервере, запрашивая их напрямую
     * 
     * @param string|null $serverIp IP адрес сервера (по умолчанию используется константа)
     * @param string|null $serverPort Порт сервера (по умолчанию используется константа)
     * @param string|null $jsonFile Путь к JSON файлу (по умолчанию используется константа)
     * @return bool Успешность обновления
     */
    public static function update($serverIp = null, $serverPort = null, $jsonFile = null)
    {
        $serverIp = $serverIp ?: self::DEFAULT_SERVER_IP;
        $serverPort = $serverPort ?: self::DEFAULT_SERVER_PORT;
        $jsonFile = $jsonFile ?: self::DEFAULT_JSON_FILE;
        
        try {
            $query = new SampQueryAPI($serverIp, $serverPort);
            
            if ($query->isOnline()) {
                $serverInfo = $query->getInfo();
                $serverInfo['detailed_players'] = $query->getDetailedPlayers();
                $serverInfo['last_update'] = time();
                $serverInfo['server_ip'] = $serverIp;
                $serverInfo['server_port'] = $serverPort;
                
                $json_data = json_encode($serverInfo, JSON_UNESCAPED_UNICODE);
                
                if (!is_dir(dirname($jsonFile))) {
                    mkdir(dirname($jsonFile), 0755, true);
                }
                
                if (file_put_contents($jsonFile, $json_data) !== false) {
                    // Обновляем пиковый онлайн
                    $currentOnline = $serverInfo['players'] ?? 0;
                    self::updatePeakOnline($currentOnline);
                    
                    // Обновляем существующий экземпляр если он есть
                    if (self::$instance !== null) {
                        self::$instance->reloadData();
                    }
                    return true;
                }
            } else {
                error_log("SA:MP сервер недоступен: {$serverIp}:{$serverPort}");
            }
        } catch (Exception $e) {
            error_log("Ошибка при обновлении информации о сервере: " . $e->getMessage());
        }
        
        return false;
    }
}
