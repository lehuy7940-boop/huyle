import { useEffect, useState } from "react";

const API_URL = "https://mern-backend-1-0-pct4.onrender.com/api/students";

function App() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Lấy danh sách sinh viên
  const loadStudents = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setStudents(data);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Thêm hoặc cập nhật sinh viên
  const handleSubmit = async (e) => {
    e.preventDefault();

    const studentData = {
      studentId,
      name,
      email,
    };

    if (editingId) {
      // Cập nhật sinh viên
      await fetch(`${API_URL}/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
      });

      setEditingId(null);
    } else {
      // Thêm sinh viên
      await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
      });
    }

    setStudentId("");
    setName("");
    setEmail("");

    loadStudents();
  };

  // Chọn sinh viên để sửa
  const editStudent = (student) => {
    setStudentId(student.studentId);
    setName(student.name);
    setEmail(student.email);
    setEditingId(student._id);
  };

  // Xóa sinh viên
  const deleteStudent = async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    loadStudents();
  };

  // Hủy sửa
  const cancelEdit = () => {
    setEditingId(null);
    setStudentId("");
    setName("");
    setEmail("");
  };

  return (
    <div>
      <h1>Quản lý sinh viên - Version 2.0</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="MSSV"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
        />

        <input
          placeholder="Họ tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit">
          {editingId ? "Cập nhật" : "Thêm sinh viên"}
        </button>

        {editingId && (
          <button type="button" onClick={cancelEdit}>
            Hủy
          </button>
        )}
      </form>

      <h2>Danh sách sinh viên</h2>

      {students.map((student) => (
        <div key={student._id}>
          {student.studentId} - {student.name} - {student.email}{" "}

          <button onClick={() => editStudent(student)}>
            Sửa
          </button>

          <button onClick={() => deleteStudent(student._id)}>
            Xóa
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;