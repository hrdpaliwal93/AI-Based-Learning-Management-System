import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiMenu } from 'react-icons/fi';

const Navbar = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
            <div className="flex items-center">
                <button 
                    onClick={toggleSidebar}
                    className="mr-4 p-2 rounded-md hover:bg-slate-100 lg:hidden text-slate-500"
                >
                    <FiMenu size={20} />
                </button>
                <h1 className="text-xl font-bold text-slate-800 lg:hidden">EduPortal</h1>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                </div>
                
                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white font-medium ${user?.role === 'student' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>

                <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors ml-2"
                    title="Logout"
                >
                    <FiLogOut size={20} />
                </button>
            </div>
        </header>
    );
};

export default Navbar;
