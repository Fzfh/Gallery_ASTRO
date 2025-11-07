import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());

// Setup path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("Folder uploads dibuat otomatis!");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

app.post("/upload", upload.single("gambar"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Tidak ada file yang diupload!" });
  }
  res.json({
    message: "Upload sukses!",
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`,
  });
});

app.get("/list", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ message: "Gagal membaca folder!" });
    const fileList = files.map(filename => ({
      filename,
      url: `http://localhost:3000/uploads/${filename}`
    }));
    res.json(fileList);
  });
});

app.delete("/destroy/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);
  
  if (!filename || filename.includes('..') || filename.includes('/')) {
    return res.status(400).json({ message: "Nama file tidak valid!" });
  }
  
  fs.unlink(filePath, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ message: "File tidak ditemukan!" });
      }
      return res.status(500).json({ message: "Gagal menghapus file!" });
    }
    res.json({ message: "File berhasil dihapus!", filename });
  });
});


app.use("/uploads", express.static(uploadDir));
app.listen(3000, () => console.log(" Server jalan di http://localhost:3000"));