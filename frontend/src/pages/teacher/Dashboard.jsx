import React, { useState, useEffect } from 'react';
import { getTeacherDashboard } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiBookOpen, FiUsers, FiClipboard, FiTrendingUp } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

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

const TeacherDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await getTeacherDashboard();
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

    if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>;
    if (!data) return null;

    const { stats, enrollment_chart, performance_chart, recent_submissions } = data;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Teacher Dashboard</h1>
                    <p className="text-slate-600">Overview of your courses and student performance.</p>
                </div>
                <Link to="/teacher/tests/create" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm hidden sm:block">
                    + Create Test
                </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Courses" value={stats.total_courses} icon={FiBookOpen} colorClass="bg-gradient-to-br from-indigo-500 to-purple-600" />
                <StatCard title="Total Students" value={stats.total_students} icon={FiUsers} colorClass="bg-gradient-to-br from-purple-500 to-fuchsia-600" />
                <StatCard title="Tests Created" value={stats.tests_created} icon={FiClipboard} colorClass="bg-gradient-to-br from-fuchsia-500 to-pink-600" />
                <StatCard title="Avg Class Score" value={`${stats.avg_class_score || 0}%`} icon={FiTrendingUp} colorClass="bg-gradient-to-br from-emerald-500 to-teal-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Enrollments Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Enrollments per Course</h2>
                    <div className="h-72">
                        {enrollment_chart.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-400">Not enough data</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={enrollment_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="students" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Performance Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Average Score (Recent Tests)</h2>
                    <div className="h-72">
                        {performance_chart.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-400">Not enough data</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={performance_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Submissions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">Recent Student Submissions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-medium">Student</th>
                                <th className="p-4 font-medium">Test</th>
                                <th className="p-4 font-medium text-center">Score</th>
                                <th className="p-4 font-medium text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recent_submissions.length === 0 ? (
                                <tr><td colSpan="4" className="p-8 text-center text-slate-500">No submissions yet.</td></tr>
                            ) : recent_submissions.map((sub, i) => {
                                const isPass = parseFloat(sub.percentage) >= 50; // default pass logic
                                return (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="p-4">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs mr-3">
                                                    {sub.student_name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-slate-900">{sub.student_name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">{sub.test_title}</td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${isPass ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {sub.percentage}%
                                            </span>
                                        </td>
                                        <td className="p-4 text-right text-xs text-slate-500">
                                            {new Date(sub.submitted_at).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
