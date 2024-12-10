import React, { useState, useContext, useEffect } from "react";
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
    const { login, auth } = useContext(AuthContext);
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        // If already authenticated, redirect to appropriate dashboard
        if (auth.isAuthenticated) {
            if (auth.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/user/dashboard');
            }
        }
    }, [auth, navigate]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

const handleOtpChange = (e, index) => {
    const value = e.target.value;

    if (/^[0-9]?$/.test(value)) { // Allow only digits
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move focus to the next input box if value exists
        if (value && index < otp.length - 1) {
            const nextInput = document.getElementById(`otp-input-${index + 1}`);
            if (nextInput) {
                nextInput.focus(); // Focus on the next input
            }
        }
    }
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
                login(form.email, data.role);
                toast.success('Login successful!');

                if (data.resetRequired) {
                    navigate('/reset-password');
                } else if (data.completeProfile) {
                    navigate('/complete-profile');

                } else if (data.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/user/dashboard');
                }
            } else {
                setErrorMessage(data.message);
                toast.error('Invalid credentials, please try again.');
            }
        } catch (error) {
            setLoading(false);
            setErrorMessage('Server error');
            toast.error('Server error, please try again.');
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // const response = await fetch('http://localhost:8000/forgot-password/send-otp', {
            const response = await fetch(`${process.env.REACT_APP_BACKEND}/forgot-password/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            setLoading(false);

            if (response.status === 200) {
                toast.success('OTP sent to your email!');
                setView('verifyOtp');
            } else {
                setErrorMessage(data.message);
                toast.error(data.message);
            }
        } catch (error) {
            setLoading(false);
            toast.error('Server error, please try again.');
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        try {
            // Combine OTP digits into a single string
            const otpString = otp.join(''); // Assumes `otp` is an array of individual digits
    
            // const response = await fetch('http://localhost:8000/forgot-password/verify-otp', {
            const response = await fetch(`${process.env.REACT_APP_BACKEND}/forgot-password/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp: otpString }),
            });
    
            const data = await response.json();
            setLoading(false);
    
            if (response.status === 200) {
                toast.success('OTP verified!');
                setView('resetPassword'); // Proceed to reset password view
            } else {
                toast.error(data.message); // Display error message
            }
        } catch (error) {
            setLoading(false);
            toast.error('Server error, please try again.'); // Generic server error message
        }
    };
    

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        // Validate if passwords match
        if (newPassword !== confirmPassword) {
            setLoading(false);
            setErrorMessage('Passwords do not match!');
            toast.error('Passwords do not match!');
            return;
        }
    
        try {
            // const response = await fetch('http://localhost:8000/forgot-password/reset-password', {
            const response = await fetch(`${process.env.REACT_APP_BACKEND}/forgot-password/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password: newPassword }),
            });
    
            const data = await response.json();
            setLoading(false);
    
            if (response.status === 200) {
                toast.success('Password reset successfully!');
                setView('login');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            setLoading(false);
            toast.error('Server error, please try again.');
        }
    };

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
                                <ion-icon name={showPassword ? "eye-off" : "eye"}></ion-icon>
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
                            <a href="#" className="text-white mt-3 flex justify-center underline" onClick={() => setView('forgotPassword')}>Forgot Password?</a>
                        </div>
                    </form>
                )}

                {view === 'forgotPassword' && (
                    <form onSubmit={handleForgotPassword}>
                        <div className="flex justify-center mb-6">
                            <div className="rounded-full bg-white shadow-lg w-36 h-36 flex items-center justify-center">
                                <img 
                                    src={logo} 
                                    alt="Logo" 
                                    className="w-24 h-28"
                                />
                            </div>
                        </div>
                        <h2>Forgot Password</h2>
                        <div className="input-box">
                            <span className="icon">
                                <ion-icon name="mail"></ion-icon>
                            </span>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="Email" 
                                required 
                            />
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? 'Sending Code...' : 'Send Code'}
                        </button>
                        <a className="flex justify-end text-white mt-4 underline" href="#" onClick={() => setView('login')}>Back to Login</a>
                    </form>
                )}

                {view === 'verifyOtp' && (
                    <form onSubmit={handleVerifyOtp}>
                        <div className="flex justify-center mb-6">
                            <div className="rounded-full bg-white shadow-lg w-36 h-36 flex items-center justify-center">
                                <img 
                                    src={logo} 
                                    alt="Logo" 
                                    className="w-24 h-28"
                                />
                            </div>
                        </div>
                        <h2>Verify OTP</h2>
                        <div className="otp-container flex space-x-2 justify-center mb-4">
                            {[0, 1, 2, 3, 4, 5].map((_, index) => (
                                <input 
                                    key={index}
                                    id={`otp-input-${index}`} // Add unique id for each input
                                    type="text"
                                    maxLength="1"
                                    value={otp[index] || ''}
                                    onChange={(e) => handleOtpChange(e, index)}
                                    className="otp-box border rounded-md w-10 h-10 text-center text-lg focus:outline-none focus:border-blue-500"
                                    required
                                />
                            ))}
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>
                )}


                {view === 'resetPassword' && (
                    <form onSubmit={handleResetPassword}>
                        <div className="flex justify-center mb-6">
                            <div className="rounded-full bg-white shadow-lg w-36 h-36 flex items-center justify-center">
                                <img 
                                    src={logo} 
                                    alt="Logo" 
                                    className="w-24 h-28"
                                />
                            </div>
                        </div>
                        <h2>Reset Password</h2>
                        <div className="input-box">
                            <span className="icon" onClick={togglePasswordVisibility} style={{ cursor: 'pointer' }}>
                                <ion-icon name={showPassword ? "eye-off" : "eye"}></ion-icon>
                            </span>
                            <input 
                                type={showPassword ? "text" : "password"}
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                required 
                            />
                            <label>New Password</label>
                        </div>
                        <div className="input-box">
                            <span className="icon" onClick={togglePasswordVisibility} style={{ cursor: 'pointer' }}>
                                <ion-icon name={showPassword ? "eye-off" : "eye"}></ion-icon>
                            </span>
                            <input 
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                required 
                            />
                            <label>Confirm New Password</label>
                        </div>
                        {errorMessage && <p style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</p>}
                        <button type="submit" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
}
