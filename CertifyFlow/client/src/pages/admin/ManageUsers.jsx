import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreHorizontal, Shield, User, Filter, Download, X, Loader2, Trash2, UserCog } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ManageUsers = () => {
    const { user: adminUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ total: 0, admins: 0, students: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch users from backend
    useEffect(() => {
        fetchUsers();
    }, [adminUser]);

    const fetchUsers = async () => {
        try {
            const token = adminUser?.token;
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            };
            const { data } = await axios.get('http://localhost:5000/api/admin/users', config);
            setUsers(data.users);
            setStats(data.stats);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    // Create new user
    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        setError('');

        try {
            const token = adminUser?.token;
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            };
            await axios.post('http://localhost:5000/api/admin/users', newUser, config);
            setSuccess('User created successfully!');
            setNewUser({ name: '', email: '', password: '', role: 'student' });
            setShowCreateModal(false);
            fetchUsers(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create user');
        } finally {
            setCreateLoading(false);
        }
    };

    // Delete user
    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            const token = adminUser?.token;
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            };
            await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, config);
            setSuccess('User deleted successfully!');
            fetchUsers(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete user');
        }
    };

    // Get user initials
    const getInitials = (name) => {
        if (!name) return 'U';
        const names = name.split(' ');
        return names.length > 1
            ? `${names[0][0]}${names[1][0]}`.toUpperCase()
            : names[0][0].toUpperCase();
    };

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Success/Error Messages */}
            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-green-50 text-green-700 px-4 py-3 rounded-xl flex justify-between items-center"
                    >
                        <span>{success}</span>
                        <button onClick={() => setSuccess('')}><X className="w-4 h-4" /></button>
                    </motion.div>
                )}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-red-50 text-red-700 px-4 py-3 rounded-xl flex justify-between items-center"
                    >
                        <span>{error}</span>
                        <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Area */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#8FB9AA]/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#2F3E3A]">Manage Users</h1>
                    <p className="text-[#5F7A74] mt-1 text-sm">
                        Create, edit, and manage user access and roles.
                    </p>
                </div>
                <motion.button
                    onClick={() => setShowCreateModal(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-[#6FA295] hover:bg-[#5F9487] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#6FA295]/20 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Create New User
                </motion.button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#8FB9AA]/10">
                    <p className="text-sm text-[#8FB9AA] font-medium">Total Users</p>
                    <p className="text-3xl font-bold text-[#2F3E3A]">{stats.total}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#8FB9AA]/10">
                    <p className="text-sm text-[#8FB9AA] font-medium">Admins</p>
                    <p className="text-3xl font-bold text-[#6FA295]">{stats.admins}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#8FB9AA]/10">
                    <p className="text-sm text-[#8FB9AA] font-medium">Students</p>
                    <p className="text-3xl font-bold text-[#5F9487]">{stats.students}</p>
                </div>
            </div>

            {/* Filters & Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#8FB9AA]/10 overflow-hidden">
                {/* Filter Bar */}
                <div className="p-6 border-b border-[#8FB9AA]/10 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8FB9AA]" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-[#F5F9F8] border-none rounded-xl text-[#2F3E3A] placeholder-[#8FB9AA] focus:ring-2 focus:ring-[#6FA295]/20 outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-4 py-3 bg-[#F5F9F8] text-[#5F7A74] font-medium rounded-xl hover:bg-[#EAF7F2] transition-colors cursor-pointer outline-none"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="student">Student</option>
                        </select>
                        <button className="px-4 py-3 bg-[#F5F9F8] text-[#5F7A74] font-medium rounded-xl hover:bg-[#EAF7F2] hover:text-[#2F3E3A] transition-colors flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="w-8 h-8 text-[#6FA295] animate-spin mx-auto" />
                            <p className="text-[#8FB9AA] mt-3">Loading users...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-12 text-center">
                            <User className="w-12 h-12 text-[#8FB9AA] mx-auto mb-3" />
                            <p className="text-[#5F7A74] font-medium">No users found</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#F5F9F8]/50 border-b border-[#8FB9AA]/10">
                                    <th className="px-6 py-4 text-xs font-bold text-[#8FB9AA] uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[#8FB9AA] uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[#8FB9AA] uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[#8FB9AA] uppercase tracking-wider">Date Created</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[#8FB9AA] uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#8FB9AA]/10">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-[#F5F9F8] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6FA295] to-[#5F9487] flex items-center justify-center text-white text-sm font-bold shadow-md">
                                                    {getInitials(user.name)}
                                                </div>
                                                <span className="font-bold text-[#2F3E3A]">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#5F7A74] font-medium">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${user.role === 'admin'
                                                ? 'bg-[#EAF7F2] text-[#6FA295] border-[#6FA295]/20'
                                                : 'bg-gray-50 text-gray-500 border-gray-100'
                                                }`}>
                                                {user.role === 'admin' && <Shield className="w-3 h-3" />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#8FB9AA]">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                <div className="p-6 border-t border-[#8FB9AA]/10 flex justify-between items-center text-sm text-[#5F7A74]">
                    <span>Showing {filteredUsers.length} of {users.length} users</span>
                </div>
            </div>

            {/* Create User Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-[#2F3E3A]">Create New User</h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 hover:bg-[#F5F9F8] rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-[#8FB9AA]" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#5F7A74] mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 bg-[#F5F9F8] rounded-xl border-none outline-none focus:ring-2 focus:ring-[#6FA295]/30"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#5F7A74] mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 bg-[#F5F9F8] rounded-xl border-none outline-none focus:ring-2 focus:ring-[#6FA295]/30"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#5F7A74] mb-2">Password</label>
                                    <input
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 bg-[#F5F9F8] rounded-xl border-none outline-none focus:ring-2 focus:ring-[#6FA295]/30"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#5F7A74] mb-2">Role</label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#F5F9F8] rounded-xl border-none outline-none focus:ring-2 focus:ring-[#6FA295]/30"
                                    >
                                        <option value="student">Student</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={createLoading}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className="w-full py-4 bg-[#6FA295] hover:bg-[#5F9487] text-white font-bold rounded-xl transition-all mt-6 flex items-center justify-center gap-2"
                                >
                                    {createLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5" />
                                            Create User
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ManageUsers;
