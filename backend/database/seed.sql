USE eduportal;

-- Passwords are 'password123' hashed with BCRYPT
INSERT INTO users (name, email, password_hash, role, profile_id, department, program, year_of_study) VALUES
('Jane Smith', 'teacher@eduportal.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'EMP9001', 'Computer Science', NULL, NULL),
('John Doe', 'student@eduportal.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'STU2024001', NULL, 'Computer Science', 2);

INSERT INTO courses (teacher_id, title, description, category, thumbnail_url, objectives, is_published) VALUES
(1, 'Introduction to Web Technologies', 'Learn the basics of HTML, CSS, and JS', 'Programming', NULL, '["Understand web architecture", "Write semantic HTML", "Style with CSS"]', 1),
(1, 'Advanced Database Management', 'Deep dive into relational databases, optimization, and queries', 'Databases', NULL, '["Write complex SQL queries", "Understand indexes", "Database design"]', 1);

INSERT INTO enrollments (student_id, course_id) VALUES
(2, 1),
(2, 2);

INSERT INTO tests (course_id, title, description, time_limit_mins, due_date, passing_score, is_published) VALUES
(1, 'HTML Basics Quiz', 'A quick quiz to test your HTML knowledge', 15, '2026-12-31 23:59:59', 50, 1);

INSERT INTO questions (test_id, question_text, question_type, options_json, correct_answer, marks, order_index) VALUES
(1, 'What does HTML stand for?', 'mcq', '[{"text":"Hyper Text Markup Language","is_correct":true},{"text":"Home Tool Markup Language","is_correct":false},{"text":"Hyperlinks and Text Markup Language","is_correct":false}]', NULL, 1, 1),
(1, 'HTML is a programming language.', 'truefalse', NULL, 'false', 1, 2);
