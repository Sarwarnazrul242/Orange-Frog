import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import jwt_decode from 'jwt-decode';

const RootRedirect = () => {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if the token exists and is valid
        const token = localStorage.getItem('authToken');

        if (!token) {
            navigate('/login');
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

            // Set the role and authentication status based on the decoded token
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
};

export default RootRedirect;