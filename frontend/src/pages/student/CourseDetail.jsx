import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourse, unenrollFromCourse, getCourseTests, getMyEnrollments, getCourseResources } from '../../services/api';
import toast from 'react-hot-toast';
import { FiClock, FiFileText, FiLogOut, FiCheckCircle, FiLock, FiVideo, FiFile } from 'react-icons/fi';

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [course, setCourse] = useState(null);
    const [tests, setTests] = useState([]);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [resources, setResources] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);

    useEffect(() => {
        fetchCourseData();
    }, [id]);

    const fetchCourseData = async () => {
        try {
            const [courseRes, testsRes, enrollmentsRes] = await Promise.all([
                getCourse(id),
                getCourseTests(id),
                getMyEnrollments()
            ]);
            
            if (courseRes.data.success) setCourse(courseRes.data.data);
            if (testsRes.data.success) setTests(testsRes.data.data);
            
            if (enrollmentsRes.data.success) {
                const enrolledIds = enrollmentsRes.data.data.map(e => e.id);
                const isUserEnrolled = enrolledIds.includes(parseInt(id));
                setIsEnrolled(isUserEnrolled);
                
                if (isUserEnrolled) {
                    const resRes = await getCourseResources(id);
                    if (resRes.data.success) setResources(resRes.data.data);
                }
            }
        } catch (error) {
            toast.error('Failed to load course details');
            navigate('/student/courses');
        } finally {
            setLoading(false);
        }
    };

    const handleUnenroll = async () => {
        if (window.confirm('Are you sure you want to unenroll? You will lose access to course materials, but past test results will be kept.')) {
            try {
                const response = await unenrollFromCourse({ course_id: id });
                if (response.data.success) {
                    toast.success('Successfully unenrolled');
                    navigate('/student/courses');
                }
            } catch (error) {
                toast.error('Failed to unenroll');
            }
        }
    };

    if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    if (!course) return <div className="text-center p-12 text-slate-500">Course not found.</div>;

    return (
        <div className="max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
                <div className="px-6 py-6 sm:flex sm:justify-between sm:items-end -mt-12">
                    <div className="bg-white p-4 rounded-xl shadow-md border border-slate-100 flex-1 sm:mr-6">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 block">{course.category || 'Course'}</span>
                        <h1 className="text-2xl font-bold text-slate-900 mb-1">{course.title}</h1>
                        <p className="text-sm text-slate-500">Instructor: <span className="font-medium text-slate-700">{course.teacher_name}</span></p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        {isEnrolled ? (
                            <button onClick={handleUnenroll} className="flex items-center text-sm text-red-600 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                                <FiLogOut className="mr-2" /> Unenroll
                            </button>
                        ) : (
                            <button onClick={() => navigate('/student/courses')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
                                Enroll to access
                            </button>
                        )}


                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6">
                {['overview', 'resources', 'tests'].map(tab => {
                    if (tab !== 'overview' && !isEnrolled) return null;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 font-medium text-sm capitalize transition-colors ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {tab}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                {activeTab === 'overview' && (
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-4">About this Course</h3>
                        <p className="text-slate-600 whitespace-pre-wrap mb-8">{course.description || 'No description provided.'}</p>
                        
                        {course.objectives && Array.isArray(course.objectives) && course.objectives.length > 0 && (
                            <>
                                <h3 className="text-lg font-bold text-slate-900 mb-4">What you will learn</h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {course.objectives.map((obj, i) => (
                                        <li key={i} className="flex items-start">
                                            <FiCheckCircle className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                                            <span className="text-slate-600 text-sm">{obj}</span>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'tests' && (
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Course Assessments</h3>
                        
                        {!isEnrolled ? (
                            <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
                                <FiLock className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                                <h4 className="font-medium text-slate-900">Content Locked</h4>
                                <p className="text-sm text-slate-500 mt-1">You must be enrolled in this course to view and take tests.</p>
                            </div>
                        ) : tests.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">No tests available for this course yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {tests.map(test => (
                                    <div key={test.id} className="border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between hover:border-blue-300 transition-colors">
                                        <div className="mb-4 md:mb-0">
                                            <div className="flex items-center mb-1">
                                                <h4 className="font-bold text-slate-900 mr-3">{test.title}</h4>
                                                {test.has_submitted && <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded font-medium border border-emerald-200">Completed</span>}
                                            </div>
                                            <p className="text-sm text-slate-500 line-clamp-1 mb-2">{test.description}</p>
                                            <div className="flex items-center text-xs text-slate-500 gap-4">
                                                <span className="flex items-center"><FiClock className="mr-1" /> {test.time_limit_mins ? `${test.time_limit_mins} mins` : 'No time limit'}</span>
                                                <span className="flex items-center"><FiFileText className="mr-1" /> Passing: {test.passing_score}%</span>
                                            </div>
                                        </div>
                                        <div>
                                            {test.has_submitted ? (
                                                <button onClick={() => navigate(`/student/result/${test.id}`)} className="w-full md:w-auto px-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                                                    View Result
                                                </button>
                                            ) : (
                                                <button onClick={() => navigate(`/student/test/${test.id}`)} className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                                    Start Test
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'resources' && (
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Course Material</h3>
                        {resources.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
                                <FiFile className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                                <h4 className="font-medium text-slate-900">No Resources Found</h4>
                                <p className="text-sm text-slate-500 mt-1">No materials have been uploaded for this course yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {resources.map(res => {
                                    const isVideo = res.type === 'video' || res.file_path.match(/\.(mp4|avi|mkv)$/i);
                                    
                                    if (isVideo) {
                                        return (
                                            <button 
                                                key={res.id}
                                                onClick={() => setSelectedVideo(`http://localhost/eduportal/api/${res.file_path}`)}
                                                className="flex items-center text-left p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group w-full"
                                            >
                                                <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl mr-4 group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
                                                    <FiVideo />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">{res.title}</h3>
                                                    <p className="text-xs text-slate-500 uppercase">{res.type || 'Video'}</p>
                                                </div>
                                            </button>
                                        );
                                    }
                                    
                                    return (
                                        <a 
                                            key={res.id} 
                                            href={`http://localhost/eduportal/api/${res.file_path}`} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="flex items-center p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group"
                                        >
                                            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl mr-4 group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
                                                {res.file_path.match(/\.(pdf)$/i) ? <FiFileText /> : <FiFile />}
                                            </div>
                                            <div className="overflow-hidden">
                                                <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">{res.title}</h3>
                                                <p className="text-xs text-slate-500 uppercase">{res.type || 'Document'}</p>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Video Player Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-black rounded-xl overflow-hidden shadow-2xl max-w-4xl w-full">
                        <div className="flex justify-between items-center p-4 bg-slate-800 text-white">
                            <h3 className="font-bold flex items-center"><FiVideo className="mr-2" /> Video Player</h3>
                            <button onClick={() => setSelectedVideo(null)} className="text-slate-400 hover:text-white transition-colors p-1">
                                <span className="sr-only">Close</span>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="aspect-video bg-black">
                            <video 
                                src={selectedVideo} 
                                controls 
                                autoPlay 
                                className="w-full h-full object-contain"
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDetail;
