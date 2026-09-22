const express = require('express');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
require('dotenv').config();
const { pool, initDB } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Cấu hình Multer lưu file lên RAM
const upload = multer({ storage: multer.memoryStorage() });

// Khởi tạo Database nếu có biến môi trường
if (process.env.DATABASE_URL) {
  initDB();
} else {
  console.warn("WARNING: No DATABASE_URL provided. Database not initialized.");
}

// API: Tìm kiếm thông tin sinh viên
app.get('/api/search', async (req, res) => {
  try {
    let { mssv } = req.query;
    if (!mssv) {
      return res.status(400).json({ success: false, message: "Vui lòng cung cấp MSSV." });
    }

    // Chuẩn hóa MSSV
    mssv = mssv.trim().toUpperCase();

    const result = await pool.query('SELECT * FROM work_days WHERE mssv = $1', [mssv]);

    if (result.rows.length > 0) {
      const student = result.rows[0];
      return res.json({
        success: true,
        data: {
          mssv: student.mssv,
          fullName: student.full_name,
          department: student.department,
          workDays: student.work_days,
          notes: student.notes,
          updatedAt: student.updated_at
        }
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin cho mã số sinh viên này. Vui lòng kiểm tra lại!"
      });
    }
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau." });
  }
});

// API: Quản trị viên tải lên file Excel
app.post('/api/admin/upload', upload.single('file'), async (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    if (!process.env.ADMIN_SECRET_KEY || adminKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({ success: false, message: "Sai mã bí mật Quản trị viên (Admin Secret Key)." });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn file Excel để tải lên." });
    }

    // Đọc file Excel từ buffer trong RAM
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Chuyển dữ liệu sang dạng mảng 2 chiều
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    if (data.length < 2) {
      return res.status(400).json({ success: false, message: "File Excel không có dữ liệu hợp lệ (Cần ít nhất 1 dòng tiêu đề và 1 dòng dữ liệu)." });
    }

    let successCount = 0;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      
      // Bắt đầu từ dòng 2 (index 1) bỏ qua tiêu đề
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0 || row[0] === undefined) continue;

        const mssv = String(row[0]).trim().toUpperCase();
        const fullName = String(row[1] || '').trim();
        const department = String(row[2] || '').trim();
        const workDays = parseFloat(row[3]) || 0;
        const notes = String(row[4] || '').trim();

        if (!mssv || !fullName) continue;

        // Thực hiện Upsert (Cập nhật nếu đã tồn tại, chèn mới nếu chưa có)
        const query = `
          INSERT INTO work_days (mssv, full_name, department, work_days, notes, updated_at)
          VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
          ON CONFLICT (mssv) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            department = EXCLUDED.department,
            work_days = EXCLUDED.work_days,
            notes = EXCLUDED.notes,
            updated_at = CURRENT_TIMESTAMP;
        `;
        
        await client.query(query, [mssv, fullName, department, workDays, notes]);
        successCount++;
      }

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    return res.json({ success: true, message: \`Đã nạp và cập nhật thành công \${successCount} bản ghi.\` });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ success: false, message: "Lỗi khi xử lý file: " + error.message });
  }
});

app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});
