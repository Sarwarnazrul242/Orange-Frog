import React, { useState } from "react";
import './loginstyle.css';  
import logo from '../images/orange-frog-logo.png';
import { useNavigate } from 'react-router-dom'; 
import Cookies from 'js-cookie';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
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
    
        const response = await fetch('http://localhost:8000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(form)
        });
    
        const data = await response.json();
    
        if (response.status === 200) {
            Cookies.set('isAuthenticated', true);
            Cookies.set('email', form.email); 
           
    
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

                    {/* Display error message if any */}
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} 

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

                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
}
