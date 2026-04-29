import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE || 'http://localhost/eduportal/api',
    withCredentials: true, // Required for PHP sessions to work cross-origin
});

// Auth
export const registerUser = (data) => api.post('/auth/register.php', data);
export const loginUser = (data) => api.post('/auth/login.php', data);
export const logoutUser = () => api.post('/auth/logout.php');
export const getMe = () => api.get('/auth/me.php');

// Courses
export const getCourses = () => api.get('/courses/index.php');
export const createCourse = (data) => api.post('/courses/create.php', data);
export const getCourse = (id) => api.get(`/courses/show.php?id=${id}`);
export const updateCourse = (data) => api.put('/courses/update.php', data);
export const deleteCourse = (id) => api.delete(`/courses/delete.php?id=${id}`);
export const getMyCourses = () => api.get('/courses/my.php');
export const getCourseStudents = (id) => api.get(`/courses/students.php?id=${id}`);

// Enrollments
export const enrollInCourse = (data) => api.post('/enrollments/enroll.php', data);
export const unenrollFromCourse = (data) => api.delete('/enrollments/unenroll.php', { data });
export const getMyEnrollments = () => api.get('/enrollments/my.php');

// Resources
export const uploadResource = (data) => api.post('/resources/upload.php', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getCourseResources = (course_id) => api.get(`/resources/course.php?course_id=${course_id}`);
export const deleteResource = (id) => api.delete(`/resources/delete.php?id=${id}`);

// Tests
export const createTest = (data) => api.post('/tests/create.php', data);
export const getTest = (id) => api.get(`/tests/show.php?id=${id}`);
export const getCourseTests = (course_id) => api.get(`/tests/course.php?course_id=${course_id}`);
export const updateTest = (data) => api.put('/tests/update.php', data);
export const publishTest = (data) => api.post('/tests/publish.php', data);
export const deleteTest = (id) => api.delete(`/tests/delete.php?id=${id}`);
export const submitTest = (data) => api.post('/tests/submit.php', data);
export const getMyTestResult = (test_id) => api.get(`/tests/my_result.php?test_id=${test_id}`);
export const getAllTestResults = (test_id) => api.get(`/tests/all_results.php?test_id=${test_id}`);
export const getTestAnalytics = (test_id) => api.get(`/tests/analytics.php?test_id=${test_id}`);
export const submitTestFeedback = (data) => api.post('/tests/feedback.php', data);
export const getTestFeedback = (test_id) => api.get(`/tests/feedback.php?test_id=${test_id}`);
export const getMyAllResults = () => api.get('/tests/my_all_results.php');

// AI Features
export const generateQuiz = (data) => api.post('/ai/generate_quiz.php', data);
export const sendChatMessage = (data) => api.post('/ai/chat.php', data);
export const getRecommendations = () => api.get('/ai/recommendations.php');

// Dashboard
export const getStudentDashboard = () => api.get('/dashboard/student.php');
export const getTeacherDashboard = () => api.get('/dashboard/teacher.php');

export default api;
