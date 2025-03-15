from flask import Flask, request, jsonify
from pyswip import Prolog

app = Flask(__name__)

# Allow frontend to access backend
from flask_cors import CORS
CORS(app)

# Initialize Prolog
prolog = Prolog()
prolog.consult("courses.pl")  # Load your Prolog file

@app.route("/students", methods=["GET"])
def list_students():
    students = list(prolog.query("findall(S, student(S), Students)"))[0]['Students']
    return jsonify(students)

@app.route("/add_student", methods=["POST"])
def add_student():
    data = request.json
    student = data.get("student")
    if student:
        prolog.assertz(f"student({student})")
        return jsonify({"message": f"Student {student} added successfully"})
    return jsonify({"error": "Invalid request"}), 400

@app.route("/courses/<student>", methods=["GET"])
def available_courses(student):
    courses = list(prolog.query(f"findall(C, can_enroll({student}, C), Courses)"))[0]['Courses']
    return jsonify(courses)

@app.route("/enroll", methods=["POST"])
def enroll_student():
    data = request.json
    student = data.get("student")
    course = data.get("course")
    if student and course:
        result = list(prolog.query(f"can_enroll({student}, {course})"))
        if result:
            prolog.assertz(f"enrolled({student}, {course})")
            return jsonify({"message": f"{student} enrolled in {course} successfully"})
        return jsonify({"error": "Enrollment failed"}), 400
    return jsonify({"error": "Invalid request"}), 400

if __name__ == "__main__":
    app.run(debug=True)
