const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// 이미지 업로드를 처리할 미들웨어 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}${ext}`);
    },
});

const upload = multer({ storage });

// 정적 파일 제공 (업로드된 이미지를 클라이언트에 제공)
app.use("/uploads", express.static("uploads"));

// 루트 경로에 HTML 폼을 제공
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// 이미지 업로드를 처리하는 라우트
app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.json({ error: "No file uploaded" });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
    }`;
    res.json({ file_url: fileUrl });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
