import React, { useState, useEffect } from 'react';
import { getMyCourses, createTest, generateQuiz } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiSave, FiCheckCircle, FiZap, FiX } from 'react-icons/fi';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableQuestion = ({ q, index, updateQuestion, removeQuestion }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: q.id });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4">
            <div className="flex bg-slate-50 px-4 py-2 border-b border-slate-200 rounded-t-xl items-center justify-between">
                <div className="flex items-center">
                    <button {...attributes} {...listeners} className="text-slate-400 hover:text-slate-600 mr-3 cursor-grab px-2 py-1">
                        &#x2630;
                    </button>
                    <span className="font-medium text-slate-700">Question {index + 1}</span>
                </div>
                <button onClick={() => removeQuestion(q.id)} className="text-red-400 hover:text-red-600 p-1">
                    <FiTrash2 />
                </button>
            </div>
            
            <div className="p-5">
                <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                        <textarea
                            value={q.question_text}
                            onChange={(e) => updateQuestion(q.id, 'question_text', e.target.value)}
                            placeholder="Enter your question here..."
                            rows="2"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        ></textarea>
                    </div>
                    <div className="w-48 space-y-4">
                        <select
                            value={q.question_type}
                            onChange={(e) => updateQuestion(q.id, 'question_type', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                        >
                            <option value="mcq">Multiple Choice</option>
                            <option value="truefalse">True / False</option>
                            <option value="short">Short Answer</option>
                        </select>
                        <div className="flex items-center">
                            <label className="text-sm text-slate-600 mr-2">Marks:</label>
                            <input 
                                type="number" min="1" value={q.marks} 
                                onChange={(e) => updateQuestion(q.id, 'marks', parseInt(e.target.value))}
                                className="w-16 px-2 py-1 border border-slate-200 rounded outline-none text-center"
                            />
                        </div>
                    </div>
                </div>

                {/* Question Type Specific UI */}
                {q.question_type === 'mcq' && (
                    <div className="space-y-2 pl-2 border-l-2 border-purple-200">
                        {q.options.map((opt, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <input 
                                    type="radio" 
                                    name={`correct_${q.id}`} 
                                    checked={opt.is_correct}
                                    onChange={() => {
                                        const newOpts = q.options.map((o, idx) => ({ ...o, is_correct: idx === i }));
                                        updateQuestion(q.id, 'options', newOpts);
                                    }}
                                    className="w-4 h-4 text-purple-600"
                                />
                                <input 
                                    type="text" 
                                    value={opt.text}
                                    onChange={(e) => {
                                        const newOpts = [...q.options];
                                        newOpts[i].text = e.target.value;
                                        updateQuestion(q.id, 'options', newOpts);
                                    }}
                                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded focus:border-purple-400 outline-none"
                                    placeholder={`Option ${i+1}`}
                                />
                                <button 
                                    onClick={() => {
                                        const newOpts = q.options.filter((_, idx) => idx !== i);
                                        updateQuestion(q.id, 'options', newOpts);
                                    }}
                                    className="text-slate-400 hover:text-red-500"
                                    disabled={q.options.length <= 2}
                                ><FiTrash2 /></button>
                            </div>
                        ))}
                        {q.options.length < 5 && (
                            <button 
                                onClick={() => updateQuestion(q.id, 'options', [...q.options, { text: '', is_correct: false }])}
                                className="text-sm text-purple-600 font-medium ml-7 hover:underline"
                            >+ Add Option</button>
                        )}
                    </div>
                )}

                {q.question_type === 'truefalse' && (
                    <div className="flex gap-6 pl-2 border-l-2 border-purple-200">
                        <label className="flex items-center cursor-pointer">
                            <input 
                                type="radio" name={`tf_${q.id}`} checked={q.correct_answer === 'true'}
                                onChange={() => updateQuestion(q.id, 'correct_answer', 'true')}
                                className="mr-2 text-purple-600 w-4 h-4"
                            /> True
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input 
                                type="radio" name={`tf_${q.id}`} checked={q.correct_answer === 'false'}
                                onChange={() => updateQuestion(q.id, 'correct_answer', 'false')}
                                className="mr-2 text-purple-600 w-4 h-4"
                            /> False
                        </label>
                    </div>
                )}

                {q.question_type === 'short' && (
                    <div className="pl-2 border-l-2 border-purple-200">
                        <input 
                            type="text" 
                            value={q.correct_answer || ''}
                            onChange={(e) => updateQuestion(q.id, 'correct_answer', e.target.value)}
                            className="w-full md:w-1/2 px-3 py-2 border border-slate-200 rounded focus:border-purple-400 outline-none"
                            placeholder="Enter expected keyword(s) or exact answer"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

const TestBuilder = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // AI Modal State
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiTopic, setAiTopic] = useState('');
    const [aiCount, setAiCount] = useState(3);
    const [generatingQuiz, setGeneratingQuiz] = useState(false);
    
    const [testMeta, setTestMeta] = useState({
        course_id: '', title: '', description: '', time_limit_mins: '', due_date: '', passing_score: 50
    });
    
    const [questions, setQuestions] = useState([
        { id: 'q1', question_text: '', question_type: 'mcq', marks: 1, options: [{text:'', is_correct:true}, {text:'', is_correct:false}] }
    ]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await getMyCourses();
                if (res.data.success) {
                    setCourses(res.data.data);
                    if (res.data.data.length > 0) {
                        setTestMeta(prev => ({ ...prev, course_id: res.data.data[0].id }));
                    }
                }
            } catch (error) {
                toast.error('Failed to load courses');
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleMetaChange = (e) => setTestMeta({ ...testMeta, [e.target.name]: e.target.value });

    const addQuestion = () => {
        const newQ = { 
            id: `q${Date.now()}`, question_text: '', question_type: 'mcq', marks: 1, 
            options: [{text:'', is_correct:true}, {text:'', is_correct:false}] 
        };
        setQuestions([...questions, newQ]);
    };

    const removeQuestion = (id) => setQuestions(questions.filter(q => q.id !== id));

    const updateQuestion = (id, field, value) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setQuestions((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const validateForm = () => {
        if (!testMeta.title) return "Test title is required";
        if (!testMeta.course_id) return "Please select a course";
        for (let i=0; i<questions.length; i++) {
            const q = questions[i];
            if (!q.question_text) return `Question ${i+1} text is empty`;
            if (q.question_type === 'mcq') {
                if (q.options.some(o => !o.text)) return `Question ${i+1} has empty options`;
                if (!q.options.some(o => o.is_correct)) return `Question ${i+1} needs a correct option selected`;
            }
            if (q.question_type === 'truefalse' && !q.correct_answer) return `Question ${i+1} needs true/false selected`;
            if (q.question_type === 'short' && !q.correct_answer) return `Question ${i+1} needs a correct answer provided`;
        }
        return null;
    };

    const handleSave = async (is_published) => {
        const error = validateForm();
        if (error) return toast.error(error);
        
        setSaving(true);
        try {
            const payload = {
                ...testMeta,
                is_published,
                questions: questions.map(q => {
                    const clean = { ...q };
                    if (clean.question_type !== 'mcq') delete clean.options;
                    if (clean.question_type === 'mcq') delete clean.correct_answer;
                    return clean;
                })
            };
            
            const res = await createTest(payload);
            if (res.data.success) {
                toast.success(is_published ? 'Test published!' : 'Draft saved!');
                navigate('/teacher/courses');
            }
        } catch (err) {
            toast.error('Failed to save test');
        } finally {
            setSaving(false);
        }
    };

    const handleAIGenerate = async () => {
        if (!aiTopic) return toast.error("Please enter a topic");
        setGeneratingQuiz(true);
        try {
            const res = await generateQuiz({ topic: aiTopic, count: aiCount });
            if (res.data.success && res.data.data) {
                const aiQuestions = res.data.data.map((q, idx) => ({
                    id: `ai_${Date.now()}_${idx}`,
                    question_text: q.question_text || '',
                    question_type: 'mcq',
                    marks: q.marks || 1,
                    options: q.options_json || q.options || []
                }));
                setQuestions([...questions, ...aiQuestions]);
                toast.success("AI generated questions added!");
                setShowAIModal(false);
                setAiTopic('');
            }
        } catch (error) {
            toast.error("Failed to generate AI questions. Check topic.");
        } finally {
            setGeneratingQuiz(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>;

    if (courses.length === 0) return (
        <div className="text-center p-12">
            <h2 className="text-xl font-bold mb-2">No Courses Available</h2>
            <p className="text-slate-500">You need to create a course before you can build a test.</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Test Builder</h1>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Test Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Course</label>
                        <select name="course_id" value={testMeta.course_id} onChange={handleMetaChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white">
                            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Test Title</label>
                        <input type="text" name="title" value={testMeta.title} onChange={handleMetaChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. Midterm Exam" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description / Instructions</label>
                        <textarea name="description" rows="2" value={testMeta.description} onChange={handleMetaChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Time Limit (mins)</label>
                        <input type="number" min="1" name="time_limit_mins" value={testMeta.time_limit_mins} onChange={handleMetaChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Leave blank for no limit" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Passing Score (%)</label>
                        <input type="number" min="1" max="100" name="passing_score" value={testMeta.passing_score} onChange={handleMetaChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                        <input type="datetime-local" name="due_date" value={testMeta.due_date} onChange={handleMetaChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                </div>
            </div>

            <div className="mb-6 flex justify-between items-end">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-slate-800">Questions ({questions.length})</h2>
                    <button 
                        onClick={() => setShowAIModal(true)}
                        className="flex items-center text-sm font-medium text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors shadow-sm"
                    >
                        <FiZap className="mr-1 fill-amber-500" /> Magic Generate
                    </button>
                </div>
                <span className="text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">Total Marks: {questions.reduce((sum, q) => sum + (parseInt(q.marks) || 0), 0)}</span>
            </div>

            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                    {questions.map((q, index) => (
                        <SortableQuestion 
                            key={q.id} 
                            q={q} 
                            index={index} 
                            updateQuestion={updateQuestion} 
                            removeQuestion={removeQuestion} 
                        />
                    ))}
                </SortableContext>
            </DndContext>

            <button 
                onClick={addQuestion}
                className="w-full py-4 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 font-medium hover:bg-purple-50 hover:border-purple-400 transition-colors flex justify-center items-center"
            >
                <FiPlus className="mr-2" size={20} /> Add Another Question
            </button>

            {/* Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                <div className="max-w-4xl mx-auto flex justify-end gap-4 lg:ml-64 px-4">
                    <button 
                        disabled={saving}
                        onClick={() => handleSave(0)}
                        className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                    >
                        Save as Draft
                    </button>
                    <button 
                        disabled={saving}
                        onClick={() => handleSave(1)}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-sm flex items-center"
                    >
                        <FiCheckCircle className="mr-2" /> Publish Test
                    </button>
                </div>
            </div>

            {/* AI Generator Modal */}
            {showAIModal && (
                <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-amber-50">
                            <h3 className="font-bold text-amber-800 flex items-center"><FiZap className="mr-2 fill-amber-500" /> AI Question Generator</h3>
                            <button onClick={() => setShowAIModal(false)} className="text-slate-400 hover:text-slate-600"><FiX size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">What topic should the questions cover?</label>
                                <input 
                                    type="text" 
                                    value={aiTopic} 
                                    onChange={e => setAiTopic(e.target.value)} 
                                    placeholder="e.g. Thermodynamics Laws" 
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none" 
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Number of Questions (1-10)</label>
                                <input 
                                    type="number" min="1" max="10" 
                                    value={aiCount} 
                                    onChange={e => setAiCount(parseInt(e.target.value) || 1)} 
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none" 
                                />
                            </div>
                            <button 
                                onClick={handleAIGenerate}
                                disabled={generatingQuiz}
                                className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-2 rounded-lg shadow-md hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50"
                            >
                                {generatingQuiz ? 'Generating...' : 'Generate Questions'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestBuilder;
