import React, { useState, useEffect } from 'react';
import { getMyCourses, createCourse, deleteCourse, updateCourse } from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiFileText, FiBookOpen } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const CourseManager = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Modal state
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '', category: '', description: '', thumbnail_url: '', objectives: ['']
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await getMyCourses();
            if (response.data.success) {
                setCourses(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this course? All associated tests and enrollments will be lost.')) {
            try {
                const response = await deleteCourse(id);
                if (response.data.success) {
                    toast.success('Course deleted');
                    fetchCourses();
                }
            } catch (error) {
                toast.error('Failed to delete course');
            }
        }
    };

    const togglePublish = async (course) => {
        try {
            const response = await updateCourse({ ...course, is_published: course.is_published ? 0 : 1 });
            if (response.data.success) {
                toast.success(`Course ${course.is_published ? 'unpublished' : 'published'}`);
                fetchCourses();
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleObjectiveChange = (index, value) => {
        const newObj = [...formData.objectives];
        newObj[index] = value;
        setFormData({ ...formData, objectives: newObj });
    };

    const addObjective = () => setFormData({ ...formData, objectives: [...formData.objectives, ''] });
    const removeObjective = (index) => {
        const newObj = formData.objectives.filter((_, i) => i !== index);
        setFormData({ ...formData, objectives: newObj.length ? newObj : [''] });
    };

    const handleSubmit = async () => {
        try {
            const cleanedObjectives = formData.objectives.filter(o => o.trim() !== '');
            const response = await createCourse({ ...formData, objectives: cleanedObjectives, is_published: 1 }); // Default published
            if (response.data.success) {
                toast.success('Course created successfully');
                setIsModalOpen(false);
                setFormData({ title: '', category: '', description: '', thumbnail_url: '', objectives: [''] });
                setStep(1);
                fetchCourses();
            }
        } catch (error) {
            toast.error('Failed to create course');
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Course Management</h1>
                    <p className="text-slate-600">Create and manage your courses and students.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors shadow-sm"
                >
                    <FiPlus className="mr-2" /> New Course
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>
            ) : courses.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                    <FiBookOpen className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-1">No courses yet</h3>
                    <p className="text-slate-500 mb-4">Get started by creating your first course.</p>
                    <button onClick={() => setIsModalOpen(true)} className="text-purple-600 font-medium hover:text-purple-700">
                        + Create Course
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
                                    <th className="p-4 font-medium">Course Title</th>
                                    <th className="p-4 font-medium">Category</th>
                                    <th className="p-4 font-medium text-center">Students</th>
                                    <th className="p-4 font-medium text-center">Tests</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {courses.map(course => (
                                    <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-slate-900">{course.title}</div>
                                            <div className="text-xs text-slate-500 truncate max-w-xs">{course.description}</div>
                                        </td>
                                        <td className="p-4 text-slate-600">{course.category || '—'}</td>
                                        <td className="p-4 text-center font-medium text-slate-700">{course.enrolled_count || 0}</td>
                                        <td className="p-4 text-center font-medium text-slate-700">{course.tests_count || 0}</td>
                                        <td className="p-4">
                                            <button 
                                                onClick={() => togglePublish(course)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide transition-colors ${course.is_published ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                            >
                                                {course.is_published ? 'Published' : 'Draft'}
                                            </button>
                                        </td>
                                        <td className="p-4 flex justify-end gap-2 text-slate-400">
                                            <button className="p-2 hover:text-purple-600 transition-colors" title="Edit">
                                                <FiEdit2 size={18} />
                                            </button>
                                            <button className="p-2 hover:text-blue-600 transition-colors" title="View Students">
                                                <FiUsers size={18} />
                                            </button>
                                            <Link to={`/teacher/course/${course.id}/resources`} className="p-2 hover:text-emerald-600 transition-colors inline-flex" title="Manage Resources">
                                                <FiFileText size={18} />
                                            </Link>
                                            <button onClick={() => handleDelete(course.id)} className="p-2 hover:text-red-600 transition-colors" title="Delete">
                                                <FiTrash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Course Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Create New Course</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
                        </div>
                        
                        <div className="p-6">
                            {/* Progress indicators */}
                            <div className="flex mb-8">
                                {[1, 2, 3].map(s => (
                                    <div key={s} className="flex-1 flex items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{s}</div>
                                        {s < 3 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-purple-600' : 'bg-slate-200'}`}></div>}
                                    </div>
                                ))}
                            </div>

                            {/* Step 1 */}
                            {step === 1 && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Course Title</label>
                                        <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                                            <option value="">Select Category</option>
                                            <option value="Programming">Programming</option>
                                            <option value="Mathematics">Mathematics</option>
                                            <option value="Science">Science</option>
                                            <option value="Arts">Arts</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                        <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"></textarea>
                                    </div>
                                </div>
                            )}

                            {/* Step 2 */}
                            {step === 2 && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Thumbnail URL (Optional)</label>
                                        <input type="url" value={formData.thumbnail_url} onChange={e => setFormData({...formData, thumbnail_url: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="https://example.com/image.jpg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Learning Objectives</label>
                                        {formData.objectives.map((obj, i) => (
                                            <div key={i} className="flex mb-2">
                                                <input type="text" value={obj} onChange={e => handleObjectiveChange(i, e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-l-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder={`Objective ${i+1}`} />
                                                <button onClick={() => removeObjective(i)} className="bg-slate-100 text-slate-500 px-3 border border-l-0 border-slate-200 rounded-r-lg hover:bg-slate-200"><FiTrash2 /></button>
                                            </div>
                                        ))}
                                        <button onClick={addObjective} className="text-sm text-purple-600 font-medium hover:text-purple-700">+ Add Objective</button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3 */}
                            {step === 3 && (
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <h3 className="font-bold text-lg mb-2">{formData.title || 'Untitled Course'}</h3>
                                    <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mb-4">{formData.category || 'Uncategorized'}</span>
                                    <p className="text-slate-600 mb-4">{formData.description || 'No description provided.'}</p>
                                    <h4 className="font-medium text-slate-800 mb-2">Objectives:</h4>
                                    <ul className="list-disc pl-5 text-slate-600 text-sm">
                                        {formData.objectives.filter(o => o).map((o, i) => <li key={i}>{o}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between">
                            {step > 1 ? (
                                <button onClick={() => setStep(step - 1)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium">Back</button>
                            ) : <div></div>}
                            
                            {step < 3 ? (
                                <button onClick={() => setStep(step + 1)} disabled={step === 1 && !formData.title} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50">Next</button>
                            ) : (
                                <button onClick={handleSubmit} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700">Publish Course</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseManager;
