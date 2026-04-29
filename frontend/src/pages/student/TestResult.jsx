import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMyTestResult, submitTestFeedback, getTestFeedback } from '../../services/api';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiArrowLeft, FiStar, FiMessageSquare } from 'react-icons/fi';

const TestResult = () => {
    const { id } = useParams();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Feedback state
    const [rating, setRating] = useState(0);
    const [comments, setComments] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [submittingFeedback, setSubmittingFeedback] = useState(false);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const [res, fbRes] = await Promise.all([
                    getMyTestResult(id),
                    getTestFeedback(id)
                ]);
                
                if (res.data.success) {
                    setResult(res.data.data);
                }
                
                if (fbRes.data.success && fbRes.data.data) {
                    setRating(fbRes.data.data.rating);
                    setComments(fbRes.data.data.comments || '');
                    setFeedbackSubmitted(true);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [id]);

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return toast.error('Please select a star rating');
        
        setSubmittingFeedback(true);
        try {
            const res = await submitTestFeedback({ test_id: id, rating, comments });
            if (res.data.success) {
                toast.success('Feedback submitted!');
                setFeedbackSubmitted(true);
            }
        } catch (error) {
            toast.error('Failed to submit feedback');
        } finally {
            setSubmittingFeedback(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    if (!result) return <div className="text-center p-12">Result not found.</div>;

    const percentage = parseFloat(result.percentage);
    const passingScore = parseInt(result.passing_score);
    const isPass = percentage >= passingScore;
    
    let scoreColor = 'text-red-600';
    let bgScoreColor = 'bg-red-50 border-red-200';
    if (percentage >= 70) {
        scoreColor = 'text-emerald-600';
        bgScoreColor = 'bg-emerald-50 border-emerald-200';
    } else if (percentage >= passingScore) {
        scoreColor = 'text-amber-600';
        bgScoreColor = 'bg-amber-50 border-amber-200';
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <Link to={`/student/course/${result.course_id}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 mb-6 transition-colors">
                <FiArrowLeft className="mr-1" /> Back to Course
            </Link>

            {/* Score Banner */}
            <div className={`rounded-2xl p-8 mb-8 border flex flex-col md:flex-row items-center justify-between shadow-sm ${bgScoreColor}`}>
                <div className="text-center md:text-left mb-6 md:mb-0">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{result.test_title}</h1>
                    <p className="text-slate-600">{result.course_title}</p>
                    <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-white border border-slate-200 text-sm font-medium shadow-sm">
                        {isPass ? <><FiCheckCircle className="text-emerald-500 mr-2" /> Passed</> : <><FiXCircle className="text-red-500 mr-2" /> Failed</>}
                        <span className="ml-2 text-slate-400">|</span>
                        <span className="ml-2 text-slate-600">Required: {passingScore}%</span>
                    </div>
                </div>
                
                <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                    {/* SVG Donut Chart */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path className="text-white/50" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        <path className={`${scoreColor}`} strokeDasharray={`${percentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-black ${scoreColor}`}>{Math.round(percentage)}%</span>
                        <span className="text-sm font-medium text-slate-500">{result.score} / {result.max_score}</span>
                    </div>
                </div>
            </div>

            {/* Answers Review */}
            <h2 className="text-xl font-bold text-slate-800 mb-6">Question Review</h2>
            <div className="space-y-6">
                {result.answers?.map((ans, idx) => {
                    const isCorrect = ans.is_correct == 1;
                    return (
                        <div key={ans.id} className={`bg-white rounded-xl border p-6 shadow-sm ${isCorrect ? 'border-l-4 border-l-emerald-500 border-slate-200' : 'border-l-4 border-l-red-500 border-slate-200'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-medium text-slate-900">
                                    <span className="text-slate-400 font-bold mr-2">{idx + 1}.</span> 
                                    {ans.question_text}
                                </h3>
                                <span className={`shrink-0 ml-4 font-bold ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {ans.marks_awarded} / {ans.marks}
                                </span>
                            </div>

                            <div className="bg-slate-50 rounded-lg p-4 mb-3 border border-slate-100">
                                <p className="text-sm font-medium text-slate-500 mb-1">Your Answer:</p>
                                <p className={`text-base font-medium ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                                    {ans.student_answer || <span className="italic text-slate-400">No answer provided</span>}
                                </p>
                            </div>

                            {!isCorrect && ans.actual_correct && (
                                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                                    <p className="text-sm font-medium text-emerald-600 mb-1">Correct Answer:</p>
                                    <p className="text-base font-medium text-emerald-800">
                                        {ans.actual_correct}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Course Feedback Form */}
            <div className="mt-12 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center">
                    <FiMessageSquare className="text-blue-500 mr-3 text-xl" />
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Module Feedback</h2>
                        <p className="text-sm text-slate-500">Help us improve the course material</p>
                    </div>
                </div>
                <div className="p-6">
                    {feedbackSubmitted ? (
                        <div className="text-center py-6">
                            <FiCheckCircle className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
                            <h3 className="text-lg font-bold text-slate-900">Thank you for your feedback!</h3>
                            <p className="text-slate-500 mt-1">Your response helps personalize future recommendations.</p>
                            
                            <div className="mt-6 p-4 bg-slate-50 rounded-lg inline-block text-left min-w-[250px]">
                                <div className="flex mb-2 justify-center">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <FiStar key={star} className={`h-5 w-5 mx-1 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                                    ))}
                                </div>
                                {comments && <p className="text-sm text-slate-600 italic text-center">"{comments}"</p>}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleFeedbackSubmit} className="max-w-md mx-auto">
                            <div className="mb-6 text-center">
                                <label className="block text-sm font-medium text-slate-700 mb-3">How helpful was this test module?</label>
                                <div className="flex justify-center space-x-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button 
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <FiStar className={`h-8 w-8 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 hover:text-amber-200'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Additional Comments (Optional)</label>
                                <textarea 
                                    rows="3" 
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder="What did you struggle with? Was the content clear?"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                ></textarea>
                            </div>
                            <button 
                                type="submit" 
                                disabled={submittingFeedback || rating === 0}
                                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestResult;
