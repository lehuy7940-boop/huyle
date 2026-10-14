import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  "https://mern-backend-1-0-pct4.onrender.com/api/students";

const emptyForm = { studentId: "", name: "", email: "" };

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "Yêu cầu thất bại");
  }

  return data;
}

export default function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  async function loadStudents() {
    setLoading(true);

    try {
      const data = await request(API_URL);

      if (!Array.isArray(data)) {
        throw new Error("Dữ liệu danh sách không hợp lệ");
      }

      setStudents(data);
      return true;
    } catch (error) {
      setNotice({ type: "error", text: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
  }

  function changeField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);

    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([key, value]) => [key, value.trim()])
      );

      if (Object.values(payload).some((value) => !value)) {
        throw new Error("Vui lòng nhập đủ thông tin");
      }

      await request(editingId ? `${API_URL}/${editingId}` : API_URL, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const message = editingId
        ? "Đã cập nhật sinh viên."
        : "Đã thêm sinh viên mới.";

      resetForm();

      if (await loadStudents()) {
        setNotice({ type: "success", text: message });
      }
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  }

  function editStudent(student) {
    setEditingId(student._id);
    setForm({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
    });
    setNotice(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteStudent(student) {
    if (!window.confirm(`Xóa sinh viên "${student.name}"?`)) return;

    setBusy(true);
    setNotice(null);

    try {
      await request(`${API_URL}/${student._id}`, { method: "DELETE" });

      if (editingId === student._id) resetForm();

      if (await loadStudents()) {
        setNotice({ type: "success", text: "Đã xóa sinh viên." });
      }
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  }

  const keyword = search.trim().toLocaleLowerCase("vi");

  const filtered = students.filter((student) =>
    [student.studentId, student.name, student.email].some((value) =>
      String(value || "").toLocaleLowerCase("vi").includes(keyword)
    )
  );

  return (
    <main className="dashboard">
      <header className="page-header">
        <div>
          <span className="eyebrow">MERN · BÀI THỰC HÀNH 5</span>
          <h1>Quản lý sinh viên</h1>
          <p>Quản lý thông tin và tìm kiếm sinh viên trong một nơi.</p>
        </div>
        <div className="total-card">
          <strong>{students.length}</strong>
          <span>Sinh viên</span>
        </div>
      </header>

      {notice && (
        <div
          className={`notice ${notice.type}`}
          role={notice.type === "error" ? "alert" : "status"}
        >
          {notice.text}
        </div>
      )}

      <section className="panel form-panel">
        <div className="section-title">
          <span className="section-icon">+</span>
          <div>
            <h2>{editingId ? "Cập nhật sinh viên" : "Thêm sinh viên"}</h2>
            <p>Điền đầy đủ mã số, họ tên và địa chỉ email.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Mã số sinh viên
              <input
                name="studentId"
                placeholder="Ví dụ: SV001"
                value={form.studentId}
                onChange={changeField}
                disabled={busy}
                required
              />
            </label>
            <label>
              Họ và tên
              <input
                name="name"
                placeholder="Nhập họ tên"
                value={form.name}
                onChange={changeField}
                disabled={busy}
                required
              />
            </label>
            <label>
              Email
              <input
                name="email"
                type="email"
                placeholder="sinhvien@example.com"
                value={form.email}
                onChange={changeField}
                disabled={busy}
                required
              />
            </label>
          </div>

          <div className="form-actions">
            <button className="primary" disabled={busy}>
              {busy
                ? "Đang xử lý..."
                : editingId
                  ? "Lưu thay đổi"
                  : "+ Thêm sinh viên"}
            </button>

            {editingId && (
              <button
                type="button"
                className="secondary"
                onClick={resetForm}
                disabled={busy}
              >
                Hủy chỉnh sửa
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="list-header">
          <div>
            <h2>Danh sách sinh viên</h2>
            <p>{filtered.length} kết quả</p>
          </div>
          <div className="search-actions">
            <input
              aria-label="Tìm sinh viên"
              placeholder="Tìm MSSV, tên hoặc email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button
              className="secondary"
              onClick={loadStudents}
              disabled={loading || busy}
            >
              Làm mới
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>MSSV</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="empty">
                    Đang tải danh sách sinh viên...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty">
                    {search
                      ? "Không tìm thấy sinh viên phù hợp."
                      : "Chưa có sinh viên. Hãy thêm bằng biểu mẫu phía trên."}
                  </td>
                </tr>
              ) : (
                filtered.map((student, index) => (
                  <tr key={student._id}>
                    <td>{index + 1}</td>
                    <td>
                      <span className="student-code">{student.studentId}</span>
                    </td>
                    <td className="student-name">{student.name}</td>
                    <td>{student.email}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="edit"
                          onClick={() => editStudent(student)}
                          disabled={busy}
                        >
                          Sửa
                        </button>
                        <button
                          className="delete"
                          onClick={() => deleteStudent(student)}
                          disabled={busy}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer>Ứng dụng quản lý sinh viên · Lê Gia Huy</footer>
    </main>
  );
}