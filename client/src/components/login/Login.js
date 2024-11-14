import React, { useState } from "react";
import './loginstyle.css';  
import logo from '../images/orange-frog-logo.png';
import { useNavigate } from 'react-router-dom'; 
import Cookies from 'js-cookie';
import { toast } from 'sonner';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false); // State for loader
    const navigate = useNavigate(); 

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true); // Start loading

        const response = await fetch('http://localhost:8000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(form)
        });

        const data = await response.json();
        setLoading(false); // Stop loading

        if (response.status === 200) {
            Cookies.set('isAuthenticated', true);
            Cookies.set('email', form.email); 
            toast.success('Login successful!');

            // First, check if the user needs to reset their password
            if (data.resetRequired) {
                navigate('/reset-password');
            } 
            // Next, check if the profile needs completion
            else if (data.completeProfile) {
                navigate('/complete-profile');
            } 
            // Otherwise, redirect based on role
            else if (data.role === 'admin') {
                navigate('/admin'); 
            } else {
                navigate('/home');
            }
        } else {
            setErrorMessage(data.message);
            toast.error('Invalid credentials, please try again.');
        }
    };

    return (
        <div className="wrapper">
            <div className="login-box">
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
                        {loading ? (
                            <svg
                                className="animate-spin h-5 w-5 text-white inline-block mr-2"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8z"
                                ></path>
                            </svg>
                        ) : null}
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}
