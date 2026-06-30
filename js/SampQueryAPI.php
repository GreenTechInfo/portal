<?php

/**
 * Minimal SA:MP UDP query client.
 */
class SampQueryAPI
{
    private string $host;
    private int $port;
    private float $timeout;
    private ?array $info = null;

    public function __construct(string $host, int $port, float $timeout = 1.5)
    {
        $this->host = $host;
        $this->port = $port;
        $this->timeout = $timeout;
    }

    public function isOnline(): bool
    {
        $this->info = $this->queryInfo();
        return $this->info !== null;
    }

    public function getInfo(): array
    {
        if ($this->info === null) {
            $this->info = $this->queryInfo();
        }

        return $this->info ?? [];
    }

    public function getDetailedPlayers(): array
    {
        $payload = $this->query('d');
        if ($payload === null || strlen($payload) < 2) {
            return [];
        }

        $offset = 0;
        $count = $this->readUInt16($payload, $offset);
        $players = [];

        for ($i = 0; $i < $count && $offset < strlen($payload); $i++) {
            $id = $this->readUInt8($payload, $offset);
            $nameLength = $this->readUInt8($payload, $offset);
            $name = $this->readString($payload, $offset, $nameLength);
            $score = $this->readUInt32($payload, $offset);
            $ping = $this->readUInt32($payload, $offset);

            $players[] = [
                'id' => $id,
                'name' => $name,
                'score' => $score,
                'ping' => $ping,
            ];
        }

        return $players;
    }

    private function queryInfo(): ?array
    {
        $payload = $this->query('i');
        if ($payload === null || strlen($payload) < 5) {
            return null;
        }

        try {
            $offset = 0;
            return [
                'password' => $this->readUInt8($payload, $offset),
                'players' => $this->readUInt16($payload, $offset),
                'maxplayers' => $this->readUInt16($payload, $offset),
                'hostname' => $this->readLengthPrefixedString($payload, $offset),
                'gamemode' => $this->readLengthPrefixedString($payload, $offset),
                'mapname' => $this->readLengthPrefixedString($payload, $offset),
            ];
        } catch (RuntimeException $exception) {
            return null;
        }
    }

    private function query(string $opcode): ?string
    {
        $packedIp = @inet_pton($this->host);
        if ($packedIp === false || strlen($packedIp) !== 4) {
            return null;
        }

        $socket = @stream_socket_client(
            "udp://{$this->host}:{$this->port}",
            $errorNumber,
            $errorMessage,
            $this->timeout
        );

        if ($socket === false) {
            return null;
        }

        $seconds = (int) floor($this->timeout);
        $microseconds = (int) (($this->timeout - $seconds) * 1000000);
        stream_set_timeout($socket, $seconds, $microseconds);

        $packet = 'SAMP' . $packedIp . pack('v', $this->port) . $opcode;
        if (@fwrite($socket, $packet) === false) {
            fclose($socket);
            return null;
        }

        $response = @fread($socket, 65535);
        $metadata = stream_get_meta_data($socket);
        fclose($socket);

        if ($response === false || $response === '' || !empty($metadata['timed_out'])) {
            return null;
        }

        if (strlen($response) < 11 || substr($response, 0, 4) !== 'SAMP') {
            return null;
        }

        return substr($response, 11);
    }

    private function readUInt8(string $data, int &$offset): int
    {
        $this->ensureAvailable($data, $offset, 1);
        return ord($data[$offset++]);
    }

    private function readUInt16(string $data, int &$offset): int
    {
        $this->ensureAvailable($data, $offset, 2);
        $value = unpack('vvalue', substr($data, $offset, 2))['value'];
        $offset += 2;
        return $value;
    }

    private function readUInt32(string $data, int &$offset): int
    {
        $this->ensureAvailable($data, $offset, 4);
        $value = unpack('Vvalue', substr($data, $offset, 4))['value'];
        $offset += 4;
        return $value;
    }

    private function readLengthPrefixedString(string $data, int &$offset): string
    {
        $length = $this->readUInt32($data, $offset);
        return $this->readString($data, $offset, $length);
    }

    private function readString(string $data, int &$offset, int $length): string
    {
        $this->ensureAvailable($data, $offset, $length);
        $value = substr($data, $offset, $length);
        $offset += $length;
        return $value;
    }

    private function ensureAvailable(string $data, int $offset, int $length): void
    {
        if ($length < 0 || $offset + $length > strlen($data)) {
            throw new RuntimeException('Invalid SA:MP query response');
        }
    }
}
