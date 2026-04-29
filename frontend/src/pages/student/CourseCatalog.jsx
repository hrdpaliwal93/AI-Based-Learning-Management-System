import React, { useState, useEffect } from 'react';
import { getCourses, getMyEnrollments, enrollInCourse } from '../../services/api';
import { FiSearch, FiBook, FiUsers, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const CourseCatalog = () => {
    const [courses, setCourses] = useState([]);
    const [myEnrollments, setMyEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all'); // all, enrolled, not_enrolled
    const [enrolling, setEnrolling] = useState(null); // id of course being enrolled in

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [coursesRes, enrollmentsRes] = await Promise.all([
                getCourses(),
                getMyEnrollments()
            ]);
            
            if (coursesRes.data.success) {
                setCourses(coursesRes.data.data);
            }
            if (enrollmentsRes.data.success) {
                setMyEnrollments(enrollmentsRes.data.data.map(e => e.id));
            }
        } catch (error) {
            toast.error('Failed to fetch catalog');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId) => {
        if (window.confirm('Are you sure you want to enroll in this course?')) {
            setEnrolling(courseId);
            try {
                const response = await enrollInCourse({ course_id: courseId });
                if (response.data.success) {
                    toast.success('Successfully enrolled!');
                    setMyEnrollments([...myEnrollments, courseId]);
                }
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to enroll');
            } finally {
                setEnrolling(null);
            }
        }
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (course.category && course.category.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const isEnrolled = myEnrollments.includes(course.id);
        
        if (filter === 'enrolled') return matchesSearch && isEnrolled;
        if (filter === 'not_enrolled') return matchesSearch && !isEnrolled;
        return matchesSearch;
    });

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Course Catalog</h1>
                <p className="text-slate-600">Browse and enroll in available courses.</p>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="text-slate-400" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search courses..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600'}`}>All</button>
                    <button onClick={() => setFilter('enrolled')} className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'enrolled' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600'}`}>Enrolled</button>
                    <button onClick={() => setFilter('not_enrolled')} className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'not_enrolled' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600'}`}>Not Enrolled</button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
                    <FiBook className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No courses found</h3>
                    <p className="text-slate-500">Try adjusting your filters or search query.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map(course => {
                        const isEnrolled = myEnrollments.includes(course.id);
                        
                        return (
                            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:-translate-y-1 transition-transform duration-300 flex flex-col">
                                <div className="h-40 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center p-6 text-center">
                                    <h3 className="text-white font-bold text-xl line-clamp-2">{course.title}</h3>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-medium uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">{course.category || 'Course'}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">{course.description}</p>
                                    
                                    <div className="flex items-center text-xs text-slate-500 mb-4 pb-4 border-b border-slate-100">
                                        <div className="flex items-center mr-4">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 mr-2 font-bold">{course.teacher_name?.charAt(0)}</div>
                                            {course.teacher_name}
                                        </div>
                                        <div className="flex items-center ml-auto">
                                            <FiUsers className="mr-1" /> {course.enrolled_count || 0}
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        {isEnrolled ? (
                                            <Link to={`/student/course/${course.id}`} className="w-full py-2 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-medium border border-emerald-200 hover:bg-emerald-100 transition-colors">
                                                <FiCheckCircle className="mr-2" /> Enrolled - View Course
                                            </Link>
                                        ) : (
                                            <button 
                                                onClick={() => handleEnroll(course.id)}
                                                disabled={enrolling === course.id}
                                                className="w-full py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 flex justify-center items-center"
                                            >
                                                {enrolling === course.id ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Enroll Now'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CourseCatalog;
