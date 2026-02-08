import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored user
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Admin-specific login (only allows admin role)
    const adminLogin = async (email, password) => {
        try {
            const config = {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
            };

            const { data } = await axios.post('http://localhost:5000/api/auth/admin-login', { email, password }, config);

            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true, role: data.role };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message
            };
        }
    };

    // Student-specific login (only allows student role)
    const studentLogin = async (email, password) => {
        try {
            const config = {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
            };

            const { data } = await axios.post('http://localhost:5000/api/auth/student-login', { email, password }, config);

            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true, role: data.role };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message
            };
        }
    };

    // Generic login (for backward compatibility)
    const login = async (email, password, expectedRole = null) => {
        try {
            const config = {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
            };

            // Use role-specific endpoint if expectedRole is provided
            let endpoint = 'http://localhost:5000/api/auth/login';
            if (expectedRole === 'admin') {
                endpoint = 'http://localhost:5000/api/auth/admin-login';
            } else if (expectedRole === 'student') {
                endpoint = 'http://localhost:5000/api/auth/student-login';
            }

            const { data } = await axios.post(endpoint, { email, password, expectedRole }, config);

            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true, role: data.role };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message
            };
        }
    };

    // Student registration
    const register = async (name, email, password, role = 'student') => {
        try {
            const config = {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
            };

            const { data } = await axios.post('http://localhost:5000/api/auth/register', { name, email, password, role }, config);

            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true, role: data.role };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        axios.post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true });
    };

    // Update user data (for profile updates without re-login)
    const updateUser = (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            adminLogin,
            studentLogin,
            register,
            logout,
            updateUser,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};
