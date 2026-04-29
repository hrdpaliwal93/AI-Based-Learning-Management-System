import React, { useState, useEffect } from 'react';
import { getStudentDashboard, getRecommendations } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiBookOpen, FiClipboard, FiAward, FiAlertCircle, FiClock, FiCheckCircle } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mr-4 ${colorClass}`}>
            <Icon size={24} className="text-white" />
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
    </div>
);

const RecommendationsWidget = () => {
    const [recData, setRecData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecs = async () => {
            try {
                const res = await getRecommendations();
                if (res.data.success) {
                    setRecData(res.data.data);
                }
            } catch (error) {
                console.error("Failed to load recommendations");
            } finally {
                setLoading(false);
            }
        };
        fetchRecs();
    }, []);

    return (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm border border-indigo-400 overflow-hidden text-white relative">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-white opacity-10 rounded-full blur-xl"></div>
            
            <div className="p-6 relative z-10">
                <div className="flex items-center mb-4">
                    <div className="bg-white/20 p-2 rounded-lg mr-3">
                        <FiBookOpen size={20} className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold">AI Recommendations</h2>
                </div>
                
                {loading ? (
                    <div className="flex space-x-2 justify-center items-center h-24">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                ) : (
                    <div className="text-indigo-50 prose prose-sm prose-invert max-w-none">
                        {recData ? (
                           <p className="whitespace-pre-line leading-relaxed">{recData}</p>
                        ) : (
                            <p>No recommendations available right now. Keep learning!</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await getStudentDashboard();
                if (res.data.success) {
                    setData(res.data.data);
                }
            } catch (error) {
                console.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    if (!data) return null;

    const { stats, courses, upcoming_tests, recent_activity } = data;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h1>
                    <p className="text-slate-600">Here's what's happening with your learning journey.</p>
                </div>
                <button onClick={() => navigate('/student/courses')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm hidden sm:block">
                    Browse Courses
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Courses Enrolled" value={stats.courses_enrolled} icon={FiBookOpen} colorClass="bg-gradient-to-br from-blue-500 to-indigo-600" />
                <StatCard title="Tests Taken" value={stats.tests_taken} icon={FiClipboard} colorClass="bg-gradient-to-br from-purple-500 to-fuchsia-600" />
                <StatCard title="Average Score" value={`${stats.avg_score}%`} icon={FiAward} colorClass="bg-gradient-to-br from-emerald-500 to-teal-600" />
                <StatCard title="Pending Tests" value={stats.pending_tests} icon={FiAlertCircle} colorClass="bg-gradient-to-br from-amber-500 to-orange-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* My Courses */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-800">My Courses</h2>
                            <Link to="/student/courses" className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</Link>
                        </div>
                        <div className="p-6">
                            {courses.length === 0 ? (
                                <p className="text-slate-500 text-center py-4">You haven't enrolled in any courses yet.</p>
                            ) : (
                                <div className="space-y-6">
                                    {courses.map(course => {
                                        const progress = course.total_tests > 0 ? Math.round((course.completed_tests / course.total_tests) * 100) : 0;
                                        return (
                                            <div key={course.id} className="flex flex-col sm:flex-row sm:items-center justify-between group">
                                                <div className="flex items-center mb-3 sm:mb-0">
                                                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xl mr-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                        {course.title.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <Link to={`/student/course/${course.id}`} className="font-bold text-slate-800 hover:text-blue-600 transition-colors">
                                                            {course.title}
                                                        </Link>
                                                        <p className="text-xs text-slate-500">{course.category || 'Course'}</p>
                                                    </div>
                                                </div>
                                                <div className="w-full sm:w-1/3">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-slate-500 font-medium">Progress</span>
                                                        <span className="text-slate-700 font-bold">{progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                                        <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity & Performance */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Performance Trend</h2>
                        </div>
                        <div className="p-6">
                            {recent_activity.length === 0 ? (
                                <p className="text-slate-500 text-center py-4">No test data available for chart.</p>
                            ) : (
                                <div className="h-64 mb-8">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={[...recent_activity].reverse()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="test_title" tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={false} />
                                            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Line type="monotone" dataKey="percentage" name="Score (%)" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                            
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Activity Log</h3>
                            {recent_activity.length === 0 ? (
                                <p className="text-slate-500 text-center py-4">No recent activity.</p>
                            ) : (
                                <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
                                    {recent_activity.map((act, i) => (
                                        <div key={i} className="relative pl-6">
                                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></div>
                                            <p className="text-sm font-medium text-slate-800">Completed test <span className="font-bold">{act.test_title}</span></p>
                                            <p className="text-xs text-slate-500 mb-1">{act.course_title}</p>
                                            <div className="inline-block px-2 py-0.5 bg-slate-100 rounded text-xs font-bold text-slate-600 border border-slate-200">
                                                Score: {act.percentage}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Upcoming Tests */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center">
                            <FiClock className="text-amber-500 mr-2" size={20} />
                            <h2 className="text-xl font-bold text-slate-800">Upcoming Tests</h2>
                        </div>
                        <div className="p-0">
                            {upcoming_tests.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">No pending tests!</p>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {upcoming_tests.map(test => {
                                        const date = new Date(test.due_date);
                                        const isSoon = date.getTime() - new Date().getTime() < 86400000; // < 24h
                                        
                                        return (
                                            <div key={test.id} className="p-6 hover:bg-slate-50 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded truncate max-w-[150px]">
                                                        {test.course_title}
                                                    </span>
                                                    {isSoon && <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded animate-pulse">Due Soon</span>}
                                                </div>
                                                <h3 className="font-bold text-slate-900 mb-1">{test.title}</h3>
                                                <p className="text-sm text-slate-500 mb-4 flex items-center">
                                                    <FiClock className="mr-1" /> {date.toLocaleDateString()} at {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                                <Link 
                                                    to={`/student/test/${test.id}`}
                                                    className="block w-full text-center py-2 bg-blue-50 text-blue-700 font-medium rounded-lg border border-blue-200 hover:bg-blue-600 hover:text-white transition-colors"
                                                >
                                                    Start Test
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* AI Recommendations */}
                    <RecommendationsWidget />
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
