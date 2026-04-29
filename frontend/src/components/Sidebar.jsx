import React from 'react';
import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';
import { FiHome, FiBookOpen, FiClipboard, FiPieChart, FiUsers } from 'react-icons/fi';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user } = useAuth();
    const isStudent = user?.role === 'student';

    const studentLinks = [
        { name: 'Dashboard', path: '/student/dashboard', icon: FiHome },
        { name: 'Course Catalog', path: '/student/courses', icon: FiBookOpen },
        { name: 'My Results', path: '/student/results', icon: FiClipboard },
    ];

    const teacherLinks = [
        { name: 'Dashboard', path: '/teacher/dashboard', icon: FiHome },
        { name: 'My Courses', path: '/teacher/courses', icon: FiBookOpen },
        { name: 'Test Builder', path: '/teacher/tests/create', icon: FiClipboard },
        { name: 'Analytics', path: '/teacher/analytics', icon: FiPieChart },
    ];

    const links = isStudent ? studentLinks : teacherLinks;

    // Overlay for mobile
    const handleClose = () => setIsOpen(false);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-800/50 z-30 lg:hidden backdrop-blur-sm"
                    onClick={handleClose}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 bg-white w-64 border-r border-slate-200 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:flex lg:flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                <div className="h-16 flex items-center justify-center border-b border-slate-200 px-6">
                    <h2 className={`text-2xl font-bold ${isStudent ? 'text-blue-600' : 'text-purple-600'}`}>
                        EduPortal
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-3">
                    <nav className="space-y-1">
                        {links.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                onClick={handleClose}
                                className={({ isActive }) => `
                                    flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                    ${isActive 
                                        ? (isStudent ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' : 'bg-purple-50 text-purple-700 border-l-4 border-purple-600') 
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
                                    }
                                `}
                            >
                                <link.icon className={`mr-3 h-5 w-5 ${isStudent ? 'text-blue-500' : 'text-purple-500'}`} />
                                {link.name}
                            </NavLink>
                        ))}
                    </nav>
                </div>
                
                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-medium ${isStudent ? 'bg-blue-600' : 'bg-purple-600'}`}>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="ml-3 truncate">
                            <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.profile_id}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
