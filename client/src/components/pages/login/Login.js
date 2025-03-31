import React, { useState, useContext } from "react";
import './loginstyle.css';  
import logo from '../../../images/orange-frog-logo.png';
import { useNavigate } from 'react-router-dom'; 
import { toast } from 'sonner';
import { AuthContext } from '../../../AuthContext';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(Array(6).fill('')); // Initial state for 6 digits
    const [newPassword, setNewPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('login'); // 'login', 'forgotPassword', 'verifyOtp', 'resetPassword'
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [confirmPassword, setConfirmPassword] = useState('');

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });

            const data = await response.json();
            setLoading(false);

            if (response.status === 200) {
                // Save user role, ID, and token
                login(form.email, data.role, data.userId, data.token);
                toast.success('Login successful!');
                console.log("Login Response:", data);

                // Redirect users correctly based on role
                if (data.role === 'admin') {
                    navigate('/admin/dashboard');
                } else if (data.role === 'user') {
                    navigate('/user/dashboard');
                } else {
                    toast.error('Unexpected role. Please contact support.');
                }
            } else {
                toast.error('Invalid credentials, please try again.');
            }
        } catch (error) {
            setLoading(false);
            toast.error('Server error, please try again.');
        }
    };

    // ... (Other methods for OTP, Reset Password remain the same)

    return (
        <div className="wrapper">
            <div className="login-box">
                {view === 'login' && (
                    <form onSubmit={submit}>
                        <div className="flex justify-center mb-6">
                            <div className="rounded-full bg-white shadow-lg w-36 h-36 flex items-center justify-center">
                                <img 
                                    src={logo} 
                                    alt="Logo" 
                                    className="w-24 h-28"
                                />
                            </div>
                        </div>
                        <h2>Login</h2>
                        {errorMessage && <p style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</p>} 
                        <div className="input-box">
                            <span className="icon">
                                <ion-icon name="mail"></ion-icon>
                            </span>
                            <input 
                                type="email" 
                                value={form.email} 
                                onChange={handleInputChange} 
                                name="email"
                                required 
                            />
                            <label>Email</label>
                        </div>
                        <div className="input-box">
                            <span className="icon" onClick={togglePasswordVisibility} style={{ cursor: 'pointer' }}>
                                <ion-icon name={showPassword ? "eye" : "eye-off"}></ion-icon>
                            </span>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={form.password} 
                                onChange={handleInputChange} 
                                name="password"
                                required 
                            />
                            <label>Password</label>
                        </div>
                       
                        <button type="submit" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                        <div className="forgot-password">
                        <button
                            type="button"
                            className="text-white mt-3 flex bg-transparent justify-center underline"
                            onClick={() => setView('forgotPassword')}
                            >
                            Forgot Password?
                            </button>
                        </div>
                    </form>
                )}
                
                {/* The rest of the code for forgotPassword, verifyOtp, resetPassword */}
            </div>
        </div>
    );
}
