import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourse, getCourseResources, uploadResource, deleteResource } from '../../services/api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiUploadCloud, FiFileText, FiVideo, FiTrash2, FiFile } from 'react-icons/fi';

const CourseResources = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    const [title, setTitle] = useState('');
    const [type, setType] = useState('document');
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [courseRes, resourcesRes] = await Promise.all([
                getCourse(id),
                getCourseResources(id)
            ]);
            
            if (courseRes.data.success) setCourse(courseRes.data.data.course);
            if (resourcesRes.data.success) setResources(resourcesRes.data.data);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!title || !file) return toast.error('Please provide a title and select a file');

        setUploading(true);
        const formData = new FormData();
        formData.append('course_id', id);
        formData.append('title', title);
        formData.append('type', type);
        formData.append('file', file);

        try {
            const response = await uploadResource(formData);
            if (response.data.success) {
                toast.success('Resource uploaded successfully');
                setTitle('');
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                fetchData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload resource');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (resId) => {
        if (!window.confirm('Delete this resource?')) return;
        try {
            const response = await deleteResource(resId);
            if (response.data.success) {
                toast.success('Resource deleted');
                fetchData();
            }
        } catch (error) {
            toast.error('Failed to delete resource');
        }
    };

    const getIcon = (type, path) => {
        if (type === 'video' || path.match(/\.(mp4|avi|mkv)$/i)) return <FiVideo className="text-blue-500" />;
        if (path.match(/\.(pdf)$/i)) return <FiFileText className="text-red-500" />;
        return <FiFile className="text-slate-500" />;
    };

    if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center text-sm font-medium text-slate-500 mb-2">
                <Link to="/teacher/courses" className="hover:text-purple-600 flex items-center transition-colors">
                    <FiArrowLeft className="mr-1" /> Back to Courses
                </Link>
            </div>
            
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Manage Resources</h1>
                <p className="text-slate-600">Upload videos, PDFs, and files for {course?.title}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Upload Form */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <FiUploadCloud className="mr-2 text-purple-600" /> Upload New File
                    </h2>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. Lecture 1 Slides" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                            <select value={type} onChange={e => setType(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                                <option value="document">Document (PDF, PPT, Doc)</option>
                                <option value="video">Video (MP4)</option>
                                <option value="archive">Archive (ZIP)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">File</label>
                            <input type="file" ref={fileInputRef} onChange={e => setFile(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" required />
                        </div>
                        <button type="submit" disabled={uploading} className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors">
                            {uploading ? 'Uploading...' : 'Upload Resource'}
                        </button>
                    </form>
                </div>

                {/* Resources List */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 bg-slate-50">
                            <h2 className="text-lg font-bold text-slate-800">Uploaded Resources ({resources.length})</h2>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {resources.length === 0 ? (
                                <p className="text-slate-500 text-center py-12">No resources uploaded yet.</p>
                            ) : resources.map(res => (
                                <div key={res.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl mr-4">
                                            {getIcon(res.type, res.file_path)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{res.title}</p>
                                            <div className="flex text-xs text-slate-500 space-x-2">
                                                <span className="uppercase">{res.type}</span>
                                                <span>&bull;</span>
                                                <span>{new Date(res.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <a href={`http://localhost/eduportal/api/${res.file_path}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg transition-colors">View</a>
                                        <button onClick={() => handleDelete(res.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors bg-white border border-slate-200 rounded-lg shadow-sm">
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseResources;
