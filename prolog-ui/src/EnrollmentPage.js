import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css";

function App() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [availableCourses, setAvailableCourses] = useState([]);
  const [message, setMessage] = useState("");
  const [studentsInCourse, setStudentsInCourse] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(false);
  const [newStudent, setNewStudent] = useState("");

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/students");
      setStudents(res.data);
    } catch (error) {
      console.error("Error fetching students", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/courses");
      setCourses(res.data);
    } catch (error) {
      console.error("Error fetching courses", error);
    }
  };

  const checkAvailableCourses = async () => {
    if (!selectedStudent) {
      setMessage("⚠️ Please select a student first.");
      return;
    }

    setMessage("");
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/available_courses/${selectedStudent}`);
      setAvailableCourses(res.data);
    } catch (error) {
      setMessage("❌ Error fetching available courses.");
      console.error("Error fetching available courses", error);
    } finally {
      setLoading(false);
    }
  };

  const enrollStudent = async (course) => {
    if (!selectedStudent) {
      setMessage("⚠️ Please select a student first.");
      return;
    }

    setMessage("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/enroll", {
        student: selectedStudent,
        course: course,
      });
      setMessage(`✅ ${res.data.message}`);
      checkAvailableCourses();
      fetchStudentsInCourse(selectedCourse); // Refresh students in course if applicable
    } catch (error) {
      setMessage("❌ Error enrolling student.");
      console.error("Error enrolling student", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsInCourse = async (course) => {
    if (!course) {
      return; // Avoid showing an error when fetching students for enrollment
    }

    setMessage("");
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/students_in_course/${course}`);

      if (res.data.length === 0) {
        setMessage("⚠️ No students enrolled in this course.");
      }

      setStudentsInCourse(res.data);
    } catch (error) {
      setMessage("❌ Error fetching students in course.");
      console.error("Error fetching students in course", error);
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async () => {
    if (!newStudent.trim()) {
      setMessage("⚠️ Student name cannot be empty.");
      return;
    }

    setMessage("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/add_student", {
        student: newStudent,
      });

      setMessage(`✅ ${res.data.message}`);
      setNewStudent("");
      await fetchStudents();
    } catch (error) {
      setMessage("❌ Error adding student.");
      console.error("Error adding student", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>📚 Course Enrollment System</h1>

      <div className="grid">
        {/* Add Student */}
        <div className="section">
          <h2>➕ Add a New Student</h2>
          <input
            type="text"
            placeholder="Enter student name"
            value={newStudent}
            onChange={(e) => setNewStudent(e.target.value)}
          />
          <button className="press" onClick={addStudent} disabled={loading}>
            {loading ? "Adding..." : "Add Student"}
          </button>
        </div>

        {/* Student Selection & Enrollment */}
        <div className="section">
          <h2>🎓 Enroll a Student</h2>
          <label>Select Student:</label>
          <select onChange={(e) => setSelectedStudent(e.target.value)} value={selectedStudent}>
            <option value="">-- Choose --</option>
            {students.map((student) => (
              <option key={student} value={student}>
                {student}
              </option>
            ))}
          </select>
          <button className="press" onClick={checkAvailableCourses} disabled={loading}>
            {loading ? "Checking..." : "Check Available Courses"}
          </button>

          <h3>📖 Available Courses</h3>
          <ul>
            {availableCourses.length > 0 ? (
              availableCourses.map((course) => (
                <li key={course}>
                  {course}{" "}
                  <button className="press" onClick={() => enrollStudent(course)} disabled={loading}>
                    {loading ? "Processing..." : "Enroll"}
                  </button>
                </li>
              ))
            ) : (
              <p>No available courses</p>
            )}
          </ul>
        </div>

        {/* Students Enrolled in a Course */}
        <div className="section">
          <h2>📜 Students in a Course</h2>
          <label>Select Course:</label>
          <select onChange={(e) => setSelectedCourse(e.target.value)} value={selectedCourse}>
            <option value="">-- Choose --</option>
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
          <button className="press" onClick={() => fetchStudentsInCourse(selectedCourse)} disabled={loading}>
            {loading ? "Loading..." : "Check Enrolled Students"}
          </button>

          <h3>👨‍🎓 Students Enrolled:</h3>
          <ul>
            {studentsInCourse.length > 0 ? (
              studentsInCourse.map((student) => <li key={student}>{student}</li>)
            ) : (
              <p>No students enrolled</p>
            )}
          </ul>
        </div>
      </div>

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default App;
