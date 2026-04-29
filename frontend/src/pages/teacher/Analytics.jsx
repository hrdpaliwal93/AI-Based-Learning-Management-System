import React, { useState, useEffect } from 'react';
import { getMyCourses, getCourseTests, getTestFeedback } from '../../services/api';
import toast from 'react-hot-toast';
import { FiPieChart, FiMessageSquare, FiStar, FiAlertCircle } from 'react-icons/fi';

const Analytics = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [tests, setTests] = useState([]);
    const [selectedTest, setSelectedTest] = useState('');
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await getMyCourses();
                if (res.data.success && res.data.data) {
                    setCourses(res.data.data);
                }
            } catch (error) {
                toast.error('Failed to load courses');
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        if (!selectedCourse) {
            setTests([]);
            setSelectedTest('');
            return;
        }
        
        const fetchTests = async () => {
            try {
                const res = await getCourseTests(selectedCourse);
                if (res.data.success && res.data.data) {
                    setTests(res.data.data);
                }
            } catch (error) {
                toast.error('Failed to load tests');
            }
        };
        fetchTests();
    }, [selectedCourse]);

    useEffect(() => {
        if (!selectedTest) {
            setFeedback([]);
            return;
        }

        const fetchFeedback = async () => {
            try {
                const res = await getTestFeedback(selectedTest);
                if (res.data.success && res.data.data) {
                    setFeedback(res.data.data);
                }
            } catch (error) {
                toast.error('Failed to load feedback');
            }
        };
        fetchFeedback();
    }, [selectedTest]);

    const averageRating = feedback.length > 0 
        ? (feedback.reduce((sum, f) => sum + parseInt(f.rating), 0) / feedback.length).toFixed(1) 
        : 0;

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <FiPieChart className="mr-3 text-purple-600" /> Test Feedback & Analytics
            </h1>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Course</label>
                        <select 
                            value={selectedCourse} 
                            onChange={(e) => setSelectedCourse(e.target.value)} 
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                        >
                            <option value="">-- Choose a Course --</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Test</label>
                        <select 
                            value={selectedTest} 
                            onChange={(e) => setSelectedTest(e.target.value)} 
                            disabled={!selectedCourse || tests.length === 0}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400"
                        >
                            <option value="">-- Choose a Test --</option>
                            {tests.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {selectedTest && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
                            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mr-4 text-purple-600">
                                <FiMessageSquare size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Feedback</p>
                                <h3 className="text-2xl font-bold text-slate-900">{feedback.length}</h3>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
                            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mr-4 text-amber-500">
                                <FiStar size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Average Rating</p>
                                <h3 className="text-2xl font-bold text-slate-900">{averageRating} / 5.0</h3>
                            </div>
                        </div>
                    </div>

                    {/* Feedback List */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 bg-slate-50">
                            <h2 className="text-lg font-bold text-slate-800">Student Comments</h2>
                        </div>
                        <div className="p-0">
                            {feedback.length === 0 ? (
                                <div className="text-center py-12">
                                    <FiAlertCircle className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                                    <h3 className="text-lg font-medium text-slate-900">No Feedback Yet</h3>
                                    <p className="text-slate-500">Students haven't submitted feedback for this test.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {feedback.map(fb => (
                                        <div key={fb.id} className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-slate-800">{fb.student_name}</h4>
                                                <div className="flex items-center">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <FiStar key={star} className={`w-4 h-4 ${star <= fb.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-slate-600 italic">
                                                {fb.comments ? `"${fb.comments}"` : <span className="text-slate-400 font-normal">No comment provided.</span>}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-2">
                                                {new Date(fb.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;
