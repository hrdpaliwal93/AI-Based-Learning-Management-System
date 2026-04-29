CREATE DATABASE IF NOT EXISTS eduportal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eduportal;

CREATE TABLE users (
  id            INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)     NOT NULL,
  email         VARCHAR(150)     NOT NULL UNIQUE,
  password_hash VARCHAR(255)     NOT NULL,
  role          ENUM('student','teacher') NOT NULL,
  profile_id    VARCHAR(50)      NULL COMMENT 'Student ID or Employee ID',
  department    VARCHAR(100)     NULL COMMENT 'For teachers only',
  program       VARCHAR(100)     NULL COMMENT 'For students only',
  year_of_study TINYINT UNSIGNED NULL COMMENT 'For students only',
  created_at    TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE courses (
  id            INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  teacher_id    INT UNSIGNED     NOT NULL,
  title         VARCHAR(200)     NOT NULL,
  description   TEXT             NULL,
  category      VARCHAR(100)     NULL,
  thumbnail_url VARCHAR(500)     NULL,
  objectives    TEXT             NULL COMMENT 'JSON array of learning objectives',
  is_published  TINYINT(1)       DEFAULT 1,
  created_at    TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE enrollments (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id  INT UNSIGNED NOT NULL,
  course_id   INT UNSIGNED NOT NULL,
  enrolled_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id)  REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_enrollment (student_id, course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE course_materials (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id   INT UNSIGNED NOT NULL,
  title       VARCHAR(200) NOT NULL,
  type        ENUM('link','text') DEFAULT 'text',
  content     TEXT         NOT NULL,
  order_index SMALLINT     DEFAULT 0,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tests (
  id              INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  course_id       INT UNSIGNED     NOT NULL,
  title           VARCHAR(200)     NOT NULL,
  description     TEXT             NULL,
  time_limit_mins INT UNSIGNED     NULL COMMENT 'NULL means no time limit',
  due_date        DATETIME         NULL,
  passing_score   TINYINT UNSIGNED DEFAULT 50 COMMENT 'Percentage 0-100',
  is_published    TINYINT(1)       DEFAULT 0,
  created_at      TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE questions (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  test_id       INT UNSIGNED NOT NULL,
  question_text TEXT         NOT NULL,
  question_type ENUM('mcq','truefalse','short') NOT NULL,
  options_json  JSON         NULL COMMENT 'For MCQ: [{"text":"Option A","is_correct":true}, ...]',
  correct_answer TEXT        NULL COMMENT 'For truefalse: "true"/"false". For short: keyword(s)',
  marks         TINYINT UNSIGNED DEFAULT 1,
  order_index   SMALLINT         DEFAULT 0,
  FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE test_submissions (
  id           INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  test_id      INT UNSIGNED   NOT NULL,
  student_id   INT UNSIGNED   NOT NULL,
  score        FLOAT          DEFAULT 0 COMMENT 'Marks obtained',
  max_score    FLOAT          DEFAULT 0 COMMENT 'Total marks available',
  percentage   FLOAT          DEFAULT 0 COMMENT 'score / max_score * 100',
  submitted_at TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (test_id)    REFERENCES tests(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY one_attempt (test_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE submission_answers (
  id             INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  submission_id  INT UNSIGNED   NOT NULL,
  question_id    INT UNSIGNED   NOT NULL,
  student_answer TEXT           NULL,
  is_correct     TINYINT(1)     DEFAULT 0,
  marks_awarded  FLOAT          DEFAULT 0,
  FOREIGN KEY (submission_id) REFERENCES test_submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id)   REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE course_resources (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id   INT UNSIGNED NOT NULL,
  title       VARCHAR(200) NOT NULL,
  type        VARCHAR(50)  DEFAULT 'document',
  file_path   VARCHAR(500) NOT NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE test_feedback (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  test_id     INT UNSIGNED NOT NULL,
  student_id  INT UNSIGNED NOT NULL,
  rating      TINYINT UNSIGNED NOT NULL COMMENT '1 to 5',
  comments    TEXT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_test_feedback (test_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
