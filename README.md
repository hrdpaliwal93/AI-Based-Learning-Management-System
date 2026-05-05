# 🎓 EduPortal — AI-Powered Student Management System

EduPortal is a modern, full-stack Learning Management System (LMS) designed to bridge the gap between traditional academic administration and cutting-edge AI assistance. Built with **React** and **PHP**, it offers a seamless experience for both students and teachers, featuring automated quiz generation, AI-driven study recommendations, and an interactive learning assistant.

---

## 🌟 Key Features

### 👨‍🏫 For Teachers
- **Course Management:** Create, publish, and manage courses with a 3-step wizard.
- **Resource Hub:** Upload documents, videos, and study materials directly to courses.
- **AI Quiz Builder:** Manually create tests or use the **Magic Generate** feature to auto-create MCQs from any topic using AI.
- **Advanced Analytics:** Track student performance trends, view test submissions, and read student feedback.

### 👨‍🎓 For Students
- **Course Catalog:** Browse and enroll in various courses.
- **Interactive Learning:** Access course materials, watch integrated videos, and take timed tests.
- **EduBot AI Tutor:** A floating AI assistant ready to answer academic questions 24/7.
- **Results Dashboard:** Track your progress with detailed performance stats, donut charts, and searchable test history.
- **AI Recommendations:** Receive personalized study tips based on your recent test performance and course load.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS (Vanilla CSS + Modern UI/UX patterns)
- **Backend:** PHP 8.x (RESTful API architecture)
- **Database:** MySQL
- **AI Engine:** Groq AI (Llama 3.3 70B Model)
- **Authentication:** PHP Session-based Auth with Secure Password Hashing
- **Icons:** Feather Icons (react-icons)
- **Charts:** Recharts

---

## 🚀 Getting Started

Follow these steps to set up the project on your local machine using XAMPP.

### 1. Prerequisites
- [XAMPP](https://www.apachefriends.org/index.html) (Apache + MySQL + PHP)
- [Node.js](https://nodejs.org/) (for the frontend)

### 2. Database Setup
1. Open **XAMPP Control Panel** and start **Apache** and **MySQL**.
2. Go to [http://localhost/phpmyadmin](http://localhost/phpmyadmin).
3. Create a new database named `eduportal`.
4. Import the `backend/database/schema.sql` file from this project.

### 3. Backend Setup (XAMPP)
1. Copy the `backend/api` folder into your XAMPP `htdocs` directory.
2. The recommended path is: `C:\xampp\htdocs\eduportal\api\`
3. **Enable cURL:**
   - In XAMPP, click **Config** for Apache -> **PHP (php.ini)**.
   - Search for `;extension=curl` and remove the semicolon (`;`).
   - Restart Apache.

### 4. Frontend Setup
1. Open a terminal in the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```text
├── backend/
│   ├── api/
│   │   ├── ai/          # AI Chat, Quiz Gen, Recommendations
│   │   ├── auth/        # Login, Register, Session Management
│   │   ├── config/      # DB, CORS, and AI Configurations
│   │   ├── courses/     # Course CRUD operations
│   │   ├── dashboard/   # Aggregated stats for Student/Teacher
│   │   ├── tests/       # Test creation, Submission, and Grading
│   │   └── uploads/     # File upload handlers
│   └── database/        # MySQL Schema SQL file
├── frontend/
│   ├── src/
│   │   ├── components/  # Nav, Sidebar, Chatbot, ProtectedRoutes
│   │   ├── context/     # AuthContext for global state
│   │   ├── pages/       # Student & Teacher specific screens
│   │   └── services/    # Axios API service layer
```

---

## 🛡️ Security & Performance

- **CORS Configuration:** Locked to dev/production origins.
- **Session Auth:** Secure cookie-based session management.


---

## 🤝 Contributing
Contributions are welcome! If you have suggestions for new features or improvements, feel free to open an issue or submit a pull request.



---

Developed with ❤️ for the Web Technology Course Project.
