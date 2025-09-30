<?php
declare(strict_types=1);

/**
 * Simple Database helper using PDO.
 * - Mendukung override konfigurasi lewat konstruktor (array).
 * - Mengembalikan instance PDO atau null saat koneksi gagal.
 */
class Database
{
    private string $host = 'localhost';
    private string $port = '3306';
    private string $db_name = 'gamegoo';
    private string $username = 'root';
    private string $password = '';
    private string $charset = 'utf8mb4';

    private ?\PDO $conn = null;

    /**
     * Optional: terima konfigurasi untuk memudahkan testing / env berbeda.
     *
     * Contoh:
     * new Database(['host'=>'db','db_name'=>'mydb','username'=>'user','password'=>'pass']);
     *
     * @param array<string,string> $config
     */
    public function __construct(array $config = [])
    {
        $this->host     = $config['host']     ?? $this->host;
        $this->port     = $config['port']     ?? $this->port;
        $this->db_name  = $config['db_name']  ?? $this->db_name;
        $this->username = $config['username'] ?? $this->username;
        $this->password = $config['password'] ?? $this->password;
        $this->charset  = $config['charset']  ?? $this->charset;
    }

    /**
     * Mendapatkan koneksi PDO. Jika sudah terkoneksi, mengembalikan instance yang sama.
     *
     * @return \PDO|null
     */
    public function getConnection(): ?\PDO
    {
        if ($this->conn instanceof \PDO) {
            return $this->conn;
        }

        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            $this->host,
            $this->port,
            $this->db_name,
            $this->charset
        );

        try {
            $options = [
                \PDO::ATTR_ERRMODE            => \PDO::ERRMODE_EXCEPTION,
                \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                \PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            $this->conn = new \PDO($dsn, $this->username, $this->password, $options);
            return $this->conn;
        } catch (\PDOException $e) {
            // Jangan tampilkan error ke pengguna; catat ke log untuk debugging
            error_log('Database connection error: ' . $e->getMessage());
            $this->conn = null;
            return null;
        }
    }

    /**
     * Cek apakah koneksi aktif.
     */
    public function isConnected(): bool
    {
        return $this->conn instanceof \PDO;
    }

    /**
     * Tutup koneksi (set ke null agar GC membersihkan resource).
     */
    public function closeConnection(): void
    {
        $this->conn = null;
    }
}