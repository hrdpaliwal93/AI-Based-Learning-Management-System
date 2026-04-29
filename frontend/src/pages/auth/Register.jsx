import React, { useState } from 'react';
import { registerUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Register = () => {
    const { setUser } = useAuth();
    const navigate = useNavigate();
    
    const [role, setRole] = useState('student');
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        profile_id: '', program: '', year_of_study: '', department: ''
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords don't match");
        }

        setLoading(true);
        try {
            const dataToSubmit = { ...formData, role };
            // Optional cleanup for non-applicable fields
            if (role === 'student') delete dataToSubmit.department;
            if (role === 'teacher') {
                delete dataToSubmit.program;
                delete dataToSubmit.year_of_study;
            }

            const response = await registerUser(dataToSubmit);
            if (response.data.success) {
                toast.success('Registration successful!');
                setUser(response.data.data);
                navigate(`/${role}/dashboard`);
            } else {
                toast.error(response.data.message || 'Registration failed');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
                
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Create an Account</h1>
                    <p className="text-slate-600">Join EduPortal and start your journey.</p>
                </div>

                {/* Role Selector */}
                <div className="flex mb-8 bg-slate-100 p-1 rounded-lg max-w-md mx-auto">
                    <button 
                        type="button"
                        className={`flex-1 py-2 rounded-md font-medium transition-all ${role === 'student' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setRole('student')}
                    >
                        Student
                    </button>
                    <button 
                        type="button"
                        className={`flex-1 py-2 rounded-md font-medium transition-all ${role === 'teacher' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setRole('teacher')}
                    >
                        Teacher
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input type="password" name="password" required minLength={6} value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                            <input type="password" name="confirmPassword" required minLength={6} value={formData.confirmPassword} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
                        </div>
                        
                        {role === 'student' ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Student ID</label>
                                    <input type="text" name="profile_id" required value={formData.profile_id} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="STU-2024-001" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Program</label>
                                    <input type="text" name="program" required value={formData.program} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Computer Science" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Year of Study</label>
                                    <input type="number" name="year_of_study" required min={1} max={5} value={formData.year_of_study} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="1" />
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID</label>
                                    <input type="text" name="profile_id" required value={formData.profile_id} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="EMP-9001" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                    <input type="text" name="department" required value={formData.department} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Information Technology" />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white flex justify-center items-center transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''} ${role === 'student' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                        >
                            {loading ? 'Creating account...' : 'Register'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-600">
                        Already have an account?{' '}
                        <Link to="/login" className={`font-medium hover:underline ${role === 'student' ? 'text-blue-600' : 'text-purple-600'}`}>
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
