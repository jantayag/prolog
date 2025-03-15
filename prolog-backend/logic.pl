:- dynamic enrolled/2, completed/2, student/1.

% Define student
student(john).
student(juan).
% Define courses
course(cs325).
course(course1).
course(course2).
course(course3).
course(course4).

% Define course prerequisites
prerequisite(course2, course1).
prerequisite(course3, course1).
prerequisite(course4, cs325).
prerequisite(course4, course2).

completed(john, cs325).

% Max Values
max_courses_per_student(3).
max_students_per_course(3).

% Register the Student
add_student(Student) :-
    \+ student(Student),
    assertz(student(Student)),
    write(Student), write(' has been added as a student.'), nl.

add_student(Student) :-
    student(Student),
    write(Student), write(' is already a student.'), nl.

% Checker to see if student can enroll
can_enroll(Student, Course) :-
    student(Student),
    course(Course),
    \+ enrolled(Student, Course),
    \+ completed(Student, Course),
    findall(C, enrolled(Student, C), Courses),
    length(Courses, Count),
    max_courses_per_student(Max), Count < Max,
    findall(S, enrolled(S, Course), Students),
    length(Students, EnrolledCount),
    max_students_per_course(MaxEnrolled), EnrolledCount < MaxEnrolled,
    findall(Prereq, prerequisite(Course, Prereq), Prereqs),
    forall(member(Prereq, Prereqs), completed(Student, Prereq)).

% Find all courses the student can enroll
available_courses(Student) :-
    findall(Course, (course(Course), can_enroll(Student, Course)), Courses),
    write('Courses available for '), write(Student), write(': '), write(Courses), nl.

% Enroll a student to a course
enroll(Student, Course) :-
    can_enroll(Student, Course),
    assertz(enrolled(Student, Course)),
    write(Student), write(' successfully enrolled in '), write(Course), nl.

% Failed Case
enroll(Student, Course) :-
    \+ can_enroll(Student, Course),
    write('Enrollment failed for '), write(Student), write(' in '), write(Course), write('. Check student registry, course registry, prerequisites, course limits, or availability.'), nl.

% Complete a course
complete_course(Student, Course) :-
    enrolled(Student, Course),
    retract(enrolled(Student, Course)),
    assertz(completed(Student, Course)),
    write(Student), write(' has completed '), write(Course), nl.

% Failed Case
complete_course(Student, Course) :-
    \+ enrolled(Student, Course),
    write(Student), write(' is not enrolled in '), write(Course), write(' and cannot complete it.'), nl.

% List students enrolled in a specific course
students_in_course(Course) :-
    findall(Student, enrolled(Student, Course), Students),
    write('Students enrolled in '), write(Course), write(': '), write(Students), nl.

% List all students in the school
list_students :-
    findall(Student, student(Student), Students),
    write('All students in the school: '), write(Students), nl.