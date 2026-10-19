require('dotenv').config(); // Wajib di baris paling atas untuk membaca file .env
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Inisialisasi Groq SDK menggunakan API Key dari file .env
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Kredensial Admin RS Furniture
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_PIN = process.env.ADMIN_PIN || '211204';

// Setup direktori upload foto jika belum ada
const uploadDir = path.join(__dirname, 'public/uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Konfigurasi Multer untuk Upload Gambar Produk
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1E9);

        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Inisialisasi Database SQLite
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Gagal membuka database:', err.message);
    } else {
        console.log('Terhubung ke database SQLite RS Furniture.');
    }
});

// Buat Tabel Database & Auto-Seed Data Produk RS Furniture
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS produk (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT NOT NULL,
        kategori TEXT NOT NULL,
        bahan TEXT NOT NULL,
        panjang REAL,
        lebar REAL,
        tinggi REAL,
        harga INTEGER NOT NULL,
        deskripsi TEXT,
        foto_url TEXT,
        stok INTEGER DEFAULT 5
    )`);

    db.get("SELECT COUNT(*) as count FROM produk", (err, row) => {
        if (err) {
            console.error("Gagal mengecek data produk:", err.message);
            return;
        }

        if (row && row.count === 0) {
            console.log("Memasukkan data seeder RS Furniture...");

            const stmt = db.prepare(`
                INSERT INTO produk
                (nama, kategori, bahan, panjang, lebar, tinggi, harga, deskripsi, foto_url, stok)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            const rsCatalog = [
                [
                    "L Putus Rectangle",
                    "Ruang Tamu",
                    "Kain Fabric / Custom",
                    200,
                    140,
                    80,
                    1900000,
                    "Sofa L Putus Rectangle nyaman, bebas pilih & custom warna tanpa biaya tambahan. Garansi 1 Tahun.",
                    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
                    5
                ],
                [
                    "L Putus Vios",
                    "Ruang Tamu",
                    "Kain Fabric / Custom",
                    200,
                    140,
                    80,
                    1950000,
                    "Sofa L Putus Vios modern, bebas pilih & custom warna tanpa biaya tambahan. Garansi 1 Tahun.",
                    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
                    5
                ],
                [
                    "L Putus Civic",
                    "Ruang Tamu",
                    "Kain Fabric / Velvet",
                    210,
                    150,
                    85,
                    2700000,
                    "Sofa L Putus Civic dengan aksen kancing klasik. Garansi 1 Tahun.",
                    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
                    5
                ],
                [
                    "Sofa Sudut Ilufa",
                    "Ruang Tamu",
                    "Kain Fabric / Sintetis",
                    220,
                    160,
                    85,
                    2400000,
                    "Sofa sudut Ilufa elegan cocok untuk ruang keluarga. Garansi 1 Tahun.",
                    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
                    5
                ],
                [
                    "Sofa Ornhis",
                    "Ruang Tamu",
                    "Kain Suede / Fabric",
                    230,
                    160,
                    85,
                    2800000,
                    "Sofa Ornhis lengkap dengan puff dudukan tambahan. Garansi 1 Tahun.",
                    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
                    5
                ],
                [
                    "Sofa Cancer",
                    "Ruang Tamu",
                    "Kain Fabric Premium",
                    220,
                    150,
                    80,
                    2300000,
                    "Sofa Cancer desain dinamis dengan bantalan empuk. Garansi 1 Tahun.",
                    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
                    5
                ],
                [
                    "Sofa Beranak / Ottoman",
                    "Ruang Tamu",
                    "Kombinasi Fabric / Oscar",
                    250,
                    180,
                    85,
                    3800000,
                    "Sofa beranak dengan banyak stool/ottoman kecil serbaguna. Garansi 1 Tahun.",
                    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
                    5
                ],
                [
                    "Sofa Gelombang Cinta / Curved",
                    "Ruang Tamu",
                    "Kulit Oscar / Sintetis",
                    240,
                    180,
                    90,
                    2800000,
                    "Sofa bentuk lengkung mewah khas ruang tamu besar. Garansi 1 Tahun.",
                    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
                    5
                ],
                [
                    "Jaguar Series Sofa",
                    "Ruang Tamu",
                    "Kulit Oscar Premium",
                    260,
                    190,
                    95,
                    4900000,
                    "Sofa Mewah Jaguar Series dengan ukiran dan busa tebal. Garansi 1 Tahun.",
                    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
                    5
                ],
                [
                    "Boxy Sofa / Boxer",
                    "Ruang Tamu",
                    "Kulit Sintetis Tebal",
                    250,
                    190,
                    90,
                    5000000,
                    "Sofa Boxy/Boxer kokoh dan tahan lama. Garansi 1 Tahun.",
                    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
                    5
                ],
                [
                    "Sofa Headrest",
                    "Ruang Tamu",
                    "Kain Fabric Mild",
                    240,
                    160,
                    90,
                    3700000,
                    "Sofa dilengkapi penyangga kepala (headrest) yang adjustable. Garansi 1 Tahun.",
                    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
                    5
                ],
                [
                    "Sofa Elfa",
                    "Ruang Tamu",
                    "Kain Suede Soft",
                    210,
                    150,
                    85,
                    3600000,
                    "Set sofa Elfa 3-2-1 dudukan lengkap. Garansi 1 Tahun.",
                    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
                    5
                ],
                [
                    "Sofa Dolphin",
                    "Ruang Tamu",
                    "Kombinasi Fabric & Oscar",
                    200,
                    140,
                    80,
                    2800000,
                    "Sofa Dolphin minimalis modern. Garansi 1 Tahun.",
                    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
                    5
                ],
                [
                    "Sofa Demini",
                    "Ruang Tamu",
                    "Kain Fabric Bludru",
                    220,
                    150,
                    85,
                    2800000,
                    "Sofa Demini dengan bench panjang tambahan. Garansi 1 Tahun.",
                    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
                    5
                ],
                [
                    "Sofa Bed",
                    "Kamar Tidur",
                    "Kain Fabric / Canvas",
                    180,
                    110,
                    40,
                    1750000,
                    "Sofa fleksibel yang bisa dilipat menjadi tempat tidur. Garansi 1 Tahun.",
                    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
                    5
                ]
            ];

            rsCatalog.forEach(item => stmt.run(...item));

            stmt.finalize();
        }
    });
});

// API Endpoint: Get Filtered Produk
app.get('/api/produk', (req, res) => {
    const { kategori, max_budget, search } = req.query;

    let query = "SELECT * FROM produk WHERE 1=1";
    let params = [];

    if (kategori && kategori !== 'Semua') {
        query += " AND kategori = ?";
        params.push(kategori);
    }

    if (max_budget && !isNaN(max_budget) && Number(max_budget) > 0) {
        query += " AND harga <= ?";
        params.push(Number(max_budget));
    }

    if (search) {
        query += " AND (nama LIKE ? OR bahan LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
    }

    query += " ORDER BY harga ASC";

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);
    });
});

// API Endpoint: Get Detail Produk berdasarkan ID
app.get('/api/produk/:id', (req, res) => {
    db.get(
        "SELECT * FROM produk WHERE id = ?",
        [req.params.id],
        (err, row) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (!row) {
                return res.status(404).json({
                    message: "Produk tidak ditemukan"
                });
            }

            res.json(row);
        }
    );
});

// API Endpoint: Chatbot AI Menggunakan Groq API
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({
            error: "Pesan tidak boleh kosong"
        });
    }

    // Ambil daftar produk terkini dari SQLite
    db.all(
        "SELECT nama, kategori, bahan, harga, deskripsi FROM produk",
        async (err, products) => {
            if (err) {
                console.error("Database Error:", err);

                return res.status(500).json({
                    reply: "Gagal membaca data produk dari database."
                });
            }

            const productContext = JSON.stringify(products);

            const systemPrompt = `
Kamu adalah Customer Service AI yang ramah dan profesional untuk toko 'RS Furniture'.

Kontak WhatsApp Admin RS Furniture:
081-215-618-998.

Keunggulan Toko:
- Seluruh produk bergaransi 1 Tahun.
- Bebas memilih dan meng-custom warna tanpa biaya tambahan.

Berikut adalah daftar katalog produk yang saat ini tersedia di database toko kami:

${productContext}

Instruksi Respons:
1. Jawab pertanyaan pelanggan dengan sopan dan ramah dalam bahasa Indonesia.
2. Rekomendasikan nama produk beserta harganya dari data di atas jika pelanggan bertanya tentang produk/budget.
3. Jawab pertanyaan dengan ringkas dan langsung pada intinya.
`;

            try {
                const chatCompletion =
                    await groq.chat.completions.create({
                        messages: [
                            {
                                role: "system",
                                content: systemPrompt
                            },
                            {
                                role: "user",
                                content: message
                            }
                        ],

                        // Model Groq yang digunakan
                        model: "openai/gpt-oss-120b",

                        temperature: 0.5,
                        max_tokens: 300
                    });

                const reply =
                    chatCompletion.choices[0]?.message?.content ||
                    "Maaf, terjadi kendala saat memproses balasan.";

                res.json({
                    reply
                });

            } catch (error) {
                console.error("Groq API Error:", error);

                res.status(500).json({
                    reply:
                        "Maaf, sistem AI sedang tidak dapat dijangkau. Silakan hubungi admin via WhatsApp di 081-215-618-998."
                });
            }
        }
    );
});

// ==========================================
// API Endpoint Admin: Authentication
// ==========================================
app.post('/api/admin/login', (req, res) => {
    const { username, password, pin } = req.body || {};

    // 1. Cek Login via PIN
    if (pin !== undefined && pin !== null && String(pin).trim() !== '') {
        const cleanPin = String(pin).trim();
        if (cleanPin === String(ADMIN_PIN).trim()) {
            return res.json({
                success: true,
                message: 'Login berhasil!',
                admin: { username: ADMIN_USERNAME },
                token: 'rs-admin-auth-' + Buffer.from(`${ADMIN_USERNAME}:${Date.now()}`).toString('base64')
            });
        }
        return res.status(401).json({
            success: false,
            message: 'PIN admin yang dimasukkan salah.'
        });
    }

    // 2. Cek Login via Username & Password
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username dan password wajib diisi.'
        });
    }

    const cleanUsername = String(username).trim();
    const cleanPassword = String(password).trim();

    if (
        (cleanUsername === ADMIN_USERNAME && cleanPassword === ADMIN_PASSWORD) ||
        (cleanUsername === ADMIN_USERNAME && cleanPassword === ADMIN_PIN)
    ) {
        return res.json({
            success: true,
            message: 'Login berhasil!',
            admin: { username: cleanUsername },
            token: 'rs-admin-auth-' + Buffer.from(`${cleanUsername}:${Date.now()}`).toString('base64')
        });
    }

    return res.status(401).json({
        success: false,
        message: 'Username atau password admin salah!'
    });
});

// API Endpoint Admin: Verifikasi Sesi
app.get('/api/admin/check', (req, res) => {
    res.json({
        status: 'active',
        admin_ready: true
    });
});

// API Endpoint Admin: Tambah Produk
app.post('/api/produk', upload.single('foto'), (req, res) => {
    const {
        nama,
        kategori,
        bahan,
        panjang,
        lebar,
        tinggi,
        harga,
        deskripsi,
        stok
    } = req.body;

    const foto_url = req.file
        ? `/uploads/${req.file.filename}`
        : "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500";

    const sql = `
        INSERT INTO produk
        (nama, kategori, bahan, panjang, lebar, tinggi, harga, deskripsi, foto_url, stok)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
        sql,
        [
            nama,
            kategori,
            bahan,
            panjang,
            lebar,
            tinggi,
            harga,
            deskripsi,
            foto_url,
            stok || 5
        ],
        function (err) {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                id: this.lastID,
                message: "Produk berhasil ditambahkan"
            });
        }
    );
});

// API Endpoint Admin: Hapus Produk
app.delete('/api/produk/:id', (req, res) => {
    db.run(
        "DELETE FROM produk WHERE id = ?",
        [req.params.id],
        function (err) {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Produk berhasil dihapus"
            });
        }
    );
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(
        `Server RS Furniture aktif berjalan di http://localhost:${PORT}`
    );
});