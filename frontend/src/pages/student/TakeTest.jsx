import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTest, submitTest } from '../../services/api';
import toast from 'react-hot-toast';
import { FiClock, FiFlag, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const TakeTest = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [test, setTest] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [testStarted, setTestStarted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // State during test
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { q_id: answer_string }
    const [flagged, setFlagged] = useState({}); // { q_id: true/false }
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const res = await getTest(id);
                if (res.data.success) {
                    setTest(res.data.data);
                    setQuestions(res.data.data.questions || []);
                }
            } catch (error) {
                toast.error('Failed to load test or you are not authorized');
                navigate('/student/courses');
            } finally {
                setLoading(false);
            }
        };
        fetchTest();
    }, [id, navigate]);

    // Timer logic
    useEffect(() => {
        if (!testStarted || timeLeft === null) return;
        
        if (timeLeft <= 0) {
            handleSubmit(true); // Auto submit
            return;
        }
        
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [testStarted, timeLeft]);

    const startTest = () => {
        if (test.time_limit_mins) {
            setTimeLeft(test.time_limit_mins * 60);
        }
        setTestStarted(true);
    };

    const handleAnswerChange = (qId, value) => {
        setAnswers({ ...answers, [qId]: value });
    };

    const toggleFlag = (qId) => {
        setFlagged({ ...flagged, [qId]: !flagged[qId] });
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleSubmit = async (auto = false) => {
        if (!auto) {
            const answeredCount = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== '').length;
            if (!window.confirm(`You have answered ${answeredCount} of ${questions.length} questions. Are you sure you want to submit?`)) {
                return;
            }
        } else {
            toast('Time is up! Submitting automatically...', { icon: '⏱️' });
        }

        setSubmitting(true);
        try {
            const payload = {
                test_id: parseInt(id),
                answers: Object.keys(answers).map(qId => ({
                    question_id: parseInt(qId),
                    student_answer: answers[qId]?.toString() || ''
                }))
            };
            
            const res = await submitTest(payload);
            if (res.data.success) {
                toast.success('Test submitted successfully!');
                navigate(`/student/result/${id}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit test');
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    if (!test) return null;

    if (!testStarted) {
        return (
            <div className="max-w-2xl mx-auto py-12">
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                        <FiClock size={28} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{test.title}</h1>
                    <p className="text-slate-500 mb-8">{test.course_title}</p>
                    
                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8 text-left">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-500 uppercase font-medium">Questions</p>
                            <p className="text-xl font-bold text-slate-800">{questions.length}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-500 uppercase font-medium">Time Limit</p>
                            <p className="text-xl font-bold text-slate-800">{test.time_limit_mins ? `${test.time_limit_mins} mins` : 'None'}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 col-span-2 text-center">
                            <p className="text-xs text-slate-500 uppercase font-medium">Passing Score</p>
                            <p className="text-xl font-bold text-slate-800">{test.passing_score}%</p>
                        </div>
                    </div>

                    <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm mb-8 text-left border border-yellow-200">
                        <strong>Important:</strong> You only have one attempt. Do not refresh the page or navigate away during the test, or your progress will be lost.
                    </div>

                    <button 
                        onClick={startTest}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-sm"
                    >
                        Begin Test
                    </button>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentIndex];
    if (!currentQ) return null;

    const isUrgent = timeLeft !== null && timeLeft < 60;

    return (
        <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
                <div className="font-bold text-lg text-slate-800 truncate pr-4">{test.title}</div>
                {timeLeft !== null && (
                    <div className={`font-mono text-xl font-bold px-4 py-1 rounded-lg ${isUrgent ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
                        {formatTime(timeLeft)}
                    </div>
                )}
                <div className="text-sm font-medium text-slate-500">
                    Question {currentIndex + 1} of {questions.length}
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-12">
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
                            <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100">
                                <h2 className="text-2xl font-medium text-slate-900 leading-relaxed">
                                    <span className="text-blue-600 font-bold mr-2">{currentIndex + 1}.</span> 
                                    {currentQ.question_text}
                                </h2>
                                <button 
                                    onClick={() => toggleFlag(currentQ.id)}
                                    className={`ml-4 p-2 rounded-full transition-colors ${flagged[currentQ.id] ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-100 text-slate-400 hover:text-yellow-600'}`}
                                    title="Flag for review"
                                >
                                    <FiFlag size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {currentQ.question_type === 'mcq' && currentQ.options?.map((opt, i) => {
                                    const isSelected = answers[currentQ.id] === opt.text;
                                    return (
                                        <div 
                                            key={i} 
                                            onClick={() => handleAnswerChange(currentQ.id, opt.text)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50/50 text-blue-900 shadow-sm' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                                        >
                                            <div className="flex items-center">
                                                <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${isSelected ? 'border-blue-600' : 'border-slate-300'}`}>
                                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>}
                                                </div>
                                                <span className="text-lg">{opt.text}</span>
                                            </div>
                                        </div>
                                    );
                                })}

                                {currentQ.question_type === 'truefalse' && ['True', 'False'].map((opt) => {
                                    const isSelected = answers[currentQ.id]?.toLowerCase() === opt.toLowerCase();
                                    return (
                                        <div 
                                            key={opt} 
                                            onClick={() => handleAnswerChange(currentQ.id, opt)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center text-lg font-medium ${isSelected ? 'border-blue-500 bg-blue-50/50 text-blue-700 shadow-sm' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                                        >
                                            {opt}
                                        </div>
                                    );
                                })}

                                {currentQ.question_type === 'short' && (
                                    <textarea 
                                        rows="4"
                                        value={answers[currentQ.id] || ''}
                                        onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                                        className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none text-lg resize-none"
                                        placeholder="Type your answer here..."
                                    ></textarea>
                                )}
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between">
                            <button 
                                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                                disabled={currentIndex === 0}
                                className="flex items-center px-6 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <FiChevronLeft className="mr-2" /> Previous
                            </button>
                            
                            {currentIndex === questions.length - 1 ? (
                                <button 
                                    onClick={() => handleSubmit(false)}
                                    disabled={submitting}
                                    className="flex items-center px-8 py-3 bg-emerald-600 rounded-lg text-white font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Test'}
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                                    className="flex items-center px-6 py-3 bg-blue-600 border border-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    Next <FiChevronRight className="ml-2" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Navigator */}
                <div className="hidden lg:flex w-80 bg-white border-l border-slate-200 flex-col">
                    <div className="p-4 border-b border-slate-200">
                        <h3 className="font-bold text-slate-800">Question Navigator</h3>
                        <div className="flex gap-4 mt-3 text-xs text-slate-500">
                            <div className="flex items-center"><div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div> Answered</div>
                            <div className="flex items-center"><div className="w-3 h-3 bg-slate-200 rounded-full mr-1"></div> Unanswered</div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-4 gap-2">
                            {questions.map((q, i) => {
                                const isCurrent = i === currentIndex;
                                const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '';
                                const isFlagged = flagged[q.id];
                                
                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentIndex(i)}
                                        className={`
                                            relative aspect-square flex items-center justify-center rounded-lg font-medium text-sm transition-all
                                            ${isCurrent ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
                                            ${isAnswered ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 border' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200 border'}
                                        `}
                                    >
                                        {i + 1}
                                        {isFlagged && <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"></div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-200">
                        <button 
                            onClick={() => handleSubmit(false)}
                            disabled={submitting}
                            className="w-full py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            Submit Test
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TakeTest;
