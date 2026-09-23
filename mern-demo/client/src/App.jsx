import { useEffect, useState } from "react";

const API_URL = "/api/students";

function App() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const loadStudents = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setStudents(data);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const addStudent = async (e) => {
    e.preventDefault();

    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentId,
        name,
        email,
      }),
    });

    setStudentId("");
    setName("");
    setEmail("");

    loadStudents();
  };

  return (
    <div>
      <h1>Quản lý sinh viên</h1>

      <form onSubmit={addStudent}>
        <input
          placeholder="MSSV"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />

        <input
          placeholder="Họ tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit">Thêm sinh viên</button>
      </form>

      <h2>Danh sách sinh viên</h2>

      {students.map((student) => (
        <div key={student._id}>
          {student.studentId} - {student.name} - {student.email}
        </div>
      ))}
    </div>
  );
}

export default App;