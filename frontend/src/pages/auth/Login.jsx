import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMail, FiLock } from 'react-icons/fi';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    
    const [role, setRole] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const response = await login({ email, password, role });
        
        if (response.success) {
            toast.success('Logged in successfully!');
            navigate(`/${role}/dashboard`);
        } else {
            toast.error(response.message || 'Login failed');
        }
        
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Left side - Branding/Illustration */}
            <div className={`hidden lg:flex w-1/2 flex-col justify-center items-center text-white transition-colors duration-500 ${role === 'student' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                <div className="max-w-md text-center">
                    <h1 className="text-5xl font-bold mb-6">EduPortal</h1>
                    <p className="text-xl opacity-90">
                        {role === 'student' ? 'Your personal learning environment. Connect, learn, and grow.' : 'Empower your students. Manage courses and track progress seamlessly.'}
                    </p>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="w-full lg:w-1/2 flex justify-center items-center p-8">
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                    
                    {/* Role Selector Tabs */}
                    <div className="flex mb-8 bg-slate-100 p-1 rounded-lg">
                        <button 
                            className={`flex-1 py-2 rounded-md font-medium transition-all ${role === 'student' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setRole('student')}
                        >
                            Student
                        </button>
                        <button 
                            className={`flex-1 py-2 rounded-md font-medium transition-all ${role === 'teacher' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setRole('teacher')}
                        >
                            Teacher
                        </button>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                        <p className="text-slate-600">Please enter your details to sign in.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiMail className="text-slate-400" />
                                </div>
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 ${role === 'student' ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-purple-500 focus:border-purple-500'}`}
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiLock className="text-slate-400" />
                                </div>
                                <input 
                                    type="password" 
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 ${role === 'student' ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-purple-500 focus:border-purple-500'}`}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input id="remember-me" type="checkbox" className={`h-4 w-4 rounded border-slate-300 ${role === 'student' ? 'text-blue-600 focus:ring-blue-500' : 'text-purple-600 focus:ring-purple-500'}`} />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">Remember me</label>
                            </div>
                            <a href="#" className={`text-sm font-medium hover:underline ${role === 'student' ? 'text-blue-600' : 'text-purple-600'}`}>Forgot password?</a>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white flex justify-center items-center transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''} ${role === 'student' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                        >
                            {loading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-600">
                            Don't have an account?{' '}
                            <Link to="/register" className={`font-medium hover:underline ${role === 'student' ? 'text-blue-600' : 'text-purple-600'}`}>
                                Register here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
