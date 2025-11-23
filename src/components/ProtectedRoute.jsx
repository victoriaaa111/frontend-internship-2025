import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { csrfFetch} from '../csrf.js';

const API_BASE = import.meta.env.VITE_API_BASE;

const ProtectedRoute = ({ children, requiredRole }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await csrfFetch(`${API_BASE}/api/user/me`);


                if (response.__unauthorized || !response.ok) {
                    setIsAuthenticated(false);
                } else {
                    const data = await response.json();
                    setIsAuthenticated(true);
                    setUserRole(data.role);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                setIsAuthenticated(false);
            }
        };

        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen bg-[#d9d1c0] flex justify-center items-center">
                <div className="animate-spin h-8 w-8 border-2 border-[#331517] border-t-transparent rounded-full"></div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    //check if right role
    if (requiredRole && userRole !== requiredRole) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;