import React, { useState, useEffect } from "react";
import axios from "axios";

function CompletionPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [message, setMessage] = useState("");
  const [hasFetchedEnrolled, setHasFetchedEnrolled] = useState(false);
  const [hasFetchedCompleted, setHasFetchedCompleted] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/students");
      setStudents(res.data);
    } catch (error) {
      console.error("Error fetching students", error);
    }
  };

  const handleStudentChange = (e) => {
    setSelectedStudent(e.target.value);
    setEnrolledCourses([]);
    setCompletedCourses([]);
    setHasFetchedEnrolled(false);
    setHasFetchedCompleted(false);
    setMessage("");
  };

  const fetchEnrolledCourses = async () => {
    if (!selectedStudent) {
      setMessage("⚠️ Please select a student first.");
      return;
    }
    setMessage("");
    setHasFetchedEnrolled(true); // ✅ Only mark enrolled courses as fetched

    try {
      const res = await axios.get(`http://localhost:5000/enrolled_courses/${selectedStudent}`);
      setEnrolledCourses(res.data);
    } catch (error) {
      setMessage("❌ Error fetching enrolled courses.");
      console.error("Error fetching enrolled courses", error);
    }
  };

  const completeCourse = async (course) => {
    try {
      const res = await axios.post("http://localhost:5000/complete_course", {
        student: selectedStudent,
        course: course,
      });
      setMessage(res.data.message);
      fetchEnrolledCourses();
      fetchCompletedCourses();
    } catch (error) {
      setMessage("❌ Error completing course.");
      console.error("Error completing course", error);
    }
  };

  const fetchCompletedCourses = async () => {
    if (!selectedStudent) {
      setMessage("⚠️ Please select a student first.");
      return;
    }
    setMessage("");
    setHasFetchedCompleted(true); // ✅ Only mark completed courses as fetched

    try {
      const res = await axios.get(`http://localhost:5000/completed_courses/${selectedStudent}`);
      setCompletedCourses(res.data);
    } catch (error) {
      setMessage("❌ Error fetching completed courses.");
      console.error("Error fetching completed courses", error);
    }
  };

  return (
    <div>
      <h2>🎓 Course Completion</h2>
      <div>
        <h3>📖 Select a Student</h3>
        <select onChange={handleStudentChange} value={selectedStudent}>
          <option value="">-- Select Student --</option>
          {students.map((student) => (
            <option key={student} value={student}>{student}</option>
          ))}
        </select>
        <br></br>
        <button onClick={fetchEnrolledCourses}>Fetch Enrolled Courses</button>
        <button onClick={fetchCompletedCourses}>Fetch Completed Courses</button>
      </div>

      <div>
        <h3>✅ Complete a Course</h3>
        {hasFetchedEnrolled && enrolledCourses.length === 0 ? (
          <p>⚠️ No enrolled courses for this student.</p>
        ) : (
          <ul>
            {enrolledCourses.map((course) => (
              <li key={course}>
                {course} <button className="press" onClick={() => completeCourse(course)}>Complete</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3>📜 Completed Courses</h3>
        {hasFetchedCompleted && completedCourses.length === 0 ? (
          <p>⚠️ No completed courses for this student.</p>
        ) : (
          <ul>
            {completedCourses.map((course) => (
              <li key={course}>{course}</li>
            ))}
          </ul>
        )}
      </div>

      {message && <p>{message}</p>}
    </div>
  );
}

export default CompletionPage;
