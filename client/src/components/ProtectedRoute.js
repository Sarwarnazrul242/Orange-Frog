import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import jwt_decode from 'jwt-decode';

export default function ProtectedRoute() {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if the token exists and is valid
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            return;
        }

        let decodedToken;
        try {
            decodedToken = jwt_decode(token);
            const currentTime = Date.now() / 1000; // Current time in seconds

            if (decodedToken.exp < currentTime) {
                // Token expired, redirect to login
                localStorage.removeItem('authToken');
                navigate('/login');
                return;
            }
            
            // Set the role from the decoded token
            if (auth.isAuthenticated) {
                if (decodedToken.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/user/dashboard');
                }
            }

        } catch (error) {
            // Invalid token, clear it from localStorage
            localStorage.removeItem('authToken');
            navigate('/login');
        }
    }, [auth, navigate]);

    return null;
}
