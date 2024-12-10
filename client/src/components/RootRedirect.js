import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const RootRedirect = () => {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (auth.isAuthenticated) {
            // Redirect based on user role
            if (auth.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/user/dashboard');
            }
        } else {
            // Not authenticated, redirect to login
            navigate('/login');
        }
    }, [auth, navigate]);

    // Return null as this is just a redirect component
    return null;
};

export default RootRedirect;