import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Upload, Users, ShieldCheck, LogOut, Settings, BarChart3, FileText, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import axios from 'axios';

const Sidebar = () => {
    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { path: '/admin/upload', icon: Upload, label: 'Upload Excel' },
        { path: '/admin/certificates', icon: FileText, label: 'Manage Certificates' },
        { path: '/admin/users', icon: Users, label: 'Manage Users' },
        { path: '/admin/fraud', icon: ShieldAlert, label: 'Fraud Detection' },
    ];

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeUsers, setActiveUsers] = useState([]);

    // Fetch active users from backend
    useEffect(() => {
        const fetchActiveUsers = async () => {
            try {
                const token = user?.token;
                if (!token) return;

                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                };
                const { data } = await axios.get('http://localhost:5000/api/admin/users', config);
                // Get first 4 users for display
                setActiveUsers(data.users.slice(0, 4));
            } catch (err) {
                console.error('Error fetching active users:', err);
            }
        };
        fetchActiveUsers();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Get user initials
    const getInitials = (name) => {
        if (!name) return 'A';
        const names = name.split(' ');
        return names.length > 1
            ? `${names[0][0]}${names[1][0]}`.toUpperCase()
            : names[0][0].toUpperCase();
    };

    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-64 min-h-screen fixed left-0 top-0 flex flex-col"
            style={{ background: 'linear-gradient(180deg, #2F3E3A 0%, #1E2D2B 100%)' }}
        >
            {/* Decorative Circle */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#6FA295] rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"></div>

            {/* Decorative Circle */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#6FA295] rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"></div>


            {/* Profile Section */}
            <div className="px-6 pb-6 relative z-10">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-4"
                >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6FA295] to-[#5F9487] flex items-center justify-center text-white text-xl font-bold shadow-xl ring-2 ring-white/20">
                        {getInitials(user?.name)}
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg">{user?.name || 'Admin'}</h3>
                        <p className="text-white/50 text-sm">{user?.email || 'admin@certifyflow.com'}</p>
                    </div>
                </motion.div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 relative z-10">
                {navItems.map((item, index) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                                ? 'bg-[#6FA295] text-white shadow-lg shadow-[#6FA295]/30'
                                : 'text-white/60 hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <motion.div
                                className="flex items-center gap-3 w-full"
                                whileHover={{ x: 4 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className={`p-1 rounded-lg ${isActive ? '' : ''}`}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <span className="uppercase tracking-wide text-xs">{item.label}</span>
                            </motion.div>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 relative z-10">
                {/* Active Users / Stats */}
                <div className="mb-4 px-4">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Active Users</p>
                    <div className="flex -space-x-2">
                        {activeUsers.length > 0 ? (
                            <>
                                {activeUsers.map((u, i) => (
                                    <div
                                        key={u._id || i}
                                        className="w-8 h-8 rounded-full bg-[#5F9487] border-2 border-[#2F3E3A] flex items-center justify-center text-white text-xs font-bold"
                                        title={u.name}
                                    >
                                        {getInitials(u.name)}
                                    </div>
                                ))}
                                {activeUsers.length >= 4 && (
                                    <div className="w-8 h-8 rounded-full bg-[#6FA295] border-2 border-[#2F3E3A] flex items-center justify-center text-white text-xs font-bold">
                                        +{activeUsers.length > 4 ? activeUsers.length - 4 : ''}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-white/40 text-xs">No users yet</div>
                        )}
                    </div>
                </div>

                {/* Sign Out */}
                <motion.button
                    onClick={handleLogout}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(111, 162, 149, 0.1)' }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-[#6FA295] w-full transition-all duration-300"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="uppercase tracking-wide text-xs">Sign Out</span>
                </motion.button>
            </div>
        </motion.div>
    );
};

export default Sidebar;
