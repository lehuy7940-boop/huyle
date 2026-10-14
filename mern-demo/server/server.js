const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Student = require("./models/Student");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ghi log request để theo dõi trên Render
app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    console.log(
      `${req.method} ${req.path} ${res.statusCode} ${Date.now() - startedAt}ms`
    );
  });

  next();
});

// Cho phép Frontend gọi API
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
]
  .filter(Boolean)
  .map((url) => url.trim().replace(/\/+$/, ""));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error("Không cho phép truy cập từ origin này");
      error.status = 403;
      callback(error);
    },
    credentials: true,
  })
);

app.use(express.json());

// Chỉ nhận các trường thông tin sinh viên
function studentData(body) {
  return {
    studentId:
      typeof body.studentId === "string" ? body.studentId.trim() : "",
    name: typeof body.name === "string" ? body.name.trim() : "",
    email: typeof body.email === "string" ? body.email.trim() : "",
  };
}

// Kiểm tra ID trước khi sửa hoặc xóa
function validateId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "ID sinh viên không hợp lệ" });
  }

  next();
}

app.get("/api/hello", (req, res) => {
  res.json({ message: "Backend đang hoạt động!" });
});

// Xem danh sách
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ studentId: 1 });
    res.json(students);
  } catch (error) {
    console.error("Lỗi lấy danh sách:", error.message);
    res.status(500).json({ message: "Không thể lấy danh sách sinh viên" });
  }
});

// Thêm sinh viên
app.post("/api/students", async (req, res) => {
  try {
    const data = studentData(req.body);

    if (!data.studentId || !data.name || !data.email) {
      return res.status(400).json({ message: "Vui lòng nhập đủ thông tin" });
    }

    const existing = await Student.findOne({ studentId: data.studentId });

    if (existing) {
      return res.status(409).json({ message: "MSSV đã tồn tại" });
    }

    const student = await Student.create(data);
    res.status(201).json(student);
  } catch (error) {
    console.error("Lỗi thêm sinh viên:", error.message);
    res.status(400).json({ message: "Không thể thêm sinh viên" });
  }
});

// Cập nhật sinh viên
app.put("/api/students/:id", validateId, async (req, res) => {
  try {
    const data = studentData(req.body);

    if (!data.studentId || !data.name || !data.email) {
      return res.status(400).json({ message: "Vui lòng nhập đủ thông tin" });
    }

    const existing = await Student.findOne({
      studentId: data.studentId,
      _id: { $ne: req.params.id },
    });

    if (existing) {
      return res.status(409).json({ message: "MSSV đã tồn tại" });
    }

    const student = await Student.findByIdAndUpdate(req.params.id, data, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!student) {
      return res.status(404).json({ message: "Không tìm thấy sinh viên" });
    }

    res.json(student);
  } catch (error) {
    console.error("Lỗi cập nhật:", error.message);
    res.status(400).json({ message: "Không thể cập nhật sinh viên" });
  }
});

// Xóa sinh viên
app.delete("/api/students/:id", validateId, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Không tìm thấy sinh viên" });
    }

    res.json({ message: "Đã xóa sinh viên" });
  } catch (error) {
    console.error("Lỗi xóa sinh viên:", error.message);
    res.status(500).json({ message: "Không thể xóa sinh viên" });
  }
});

// Xử lý lỗi middleware
app.use((error, req, res, next) => {
  console.error("Request error:", error.message);

  res.status(error.status || 400).json({
    message: error.status === 403
      ? error.message
      : "Yêu cầu không hợp lệ",
  });
});

// Kết nối database thành công rồi mới chạy server
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Chưa khai báo MONGODB_URI");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Atlas connected successfully!");
    console.log(`Database: ${mongoose.connection.name}`);

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Không thể khởi động Backend:", error.message);
    process.exit(1);
  }
}

startServer();