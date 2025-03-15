from flask import Flask, jsonify, request
from flask_cors import CORS
from pyswip import Prolog

app = Flask(__name__)
CORS(app)  # Allow frontend to access backend

# Initialize Prolog
prolog = Prolog()
prolog.consult("logic.pl")  # Load the Prolog file

# Get all students
@app.route("/students", methods=["GET"])
def get_students():
    students = list(prolog.query("student(X)"))
    return jsonify([s["X"] for s in students])

# Get all courses
@app.route("/courses", methods=["GET"])
def get_courses():
    courses = list(prolog.query("course(X)"))
    return jsonify([c["X"] for c in courses])

# Get available courses for a student
@app.route("/available_courses/<student>", methods=["GET"])
def get_available_courses(student):
    courses = list(prolog.query(f"can_enroll({student}, X)"))
    return jsonify([c["X"] for c in courses])

# Enroll a student in a course
@app.route("/enroll", methods=["POST"])
def enroll_student():
    data = request.json
    student, course = data["student"], data["course"]
    
    result = list(prolog.query(f"enroll({student}, {course})"))
    if result:
        return jsonify({"message": f"✅ {student} successfully enrolled in {course}!"})
    else:
        return jsonify({"message": f"❌ Enrollment failed for {student} in {course}."}), 400

# Get students enrolled in a specific course
@app.route("/students_in_course/<course>", methods=["GET"])
def get_students_in_course(course):
    try:
        students = list(prolog.query(f"enrolled(X, {course})"))
        return jsonify([s["X"] for s in students])
    except Exception as e:
        return jsonify({"message": f"❌ Error fetching students: {str(e)}"}), 500

# Add a new student
@app.route("/add_student", methods=["POST"])
def add_student():
    data = request.json
    student = data.get("student")

    if not student:
        return jsonify({"message": "⚠️ Student name is required!"}), 400

    existing_students = list(prolog.query(f"student({student})"))
    if existing_students:
        return jsonify({"message": "⚠️ Student already exists!"}), 400

    try:
        prolog.assertz(f"student({student})")
        return jsonify({"message": f"✅ {student} added successfully!"})
    except Exception as e:
        return jsonify({"message": f"❌ Failed to add student: {str(e)}"}), 500

# Mark a course as completed
@app.route("/complete_course", methods=["POST"])
def complete_course():
    data = request.json
    student, course = data["student"], data["course"]
    
    result = list(prolog.query(f"complete_course({student}, {course})"))
    if result:
        return jsonify({"message": f"✅ {student} has completed {course}!"})
    else:
        return jsonify({"message": f"❌ {student} is not enrolled in {course} and cannot complete it."}), 400

# Get enrolled courses for a student
@app.route("/enrolled_courses/<student>", methods=["GET"])
def get_enrolled_courses(student):
    try:
        courses = list(prolog.query(f"enrolled({student}, X)"))
        return jsonify([c["X"] for c in courses])
    except Exception as e:
        return jsonify({"message": f"❌ Error fetching enrolled courses: {str(e)}"}), 500

@app.route("/completed_courses/<student>", methods=["GET"])
def get_completed_courses(student):
    try:
        courses = list(prolog.query(f"completed({student}, X)"))
        return jsonify([c["X"] for c in courses])
    except Exception as e:
        return jsonify({"message": f"❌ Error fetching completed courses: {str(e)}"}), 500

# List all students
@app.route("/list_students", methods=["GET"])
def list_students():
    students = list(prolog.query("student(X)"))
    return jsonify([s["X"] for s in students])

if __name__ == "__main__":
    app.run(debug=True, port=5000)
