import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import '../login/loginstyle.css'; 
import { toast } from 'sonner';
import { AuthContext } from '../../../AuthContext';

export default function PasswordReset() {
    const [tempPassword, setTempPassword] = useState(''); 
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const email = Cookies.get('email'); 

            // const response = await fetch('http://localhost:8000/reset-password', {
            const response = await fetch(`${process.env.REACT_APP_BACKEND}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, tempPassword, newPassword })
            });

            const data = await response.json();

            if (response.status === 200) {
                navigate('/complete-profile'); // Navigate after successful password reset
                toast.success('Password reset successfully');
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('Error resetting password');
        }
    };

    return (
        <div className="wrapper">
            <div className="login-box"> {/* Re-using the login box styling for consistency */}
                <h2>Reset Password</h2>

                {/* Error message display */}
                {error && <p style={{ color: 'red' }}>{error}</p>} 

                <form onSubmit={handlePasswordReset}>
                    <div className="input-box">
                        <span className="icon" onClick={togglePasswordVisibility} style={{ cursor: 'pointer' }}>
                            <ion-icon name={showPassword ? "eye-off" : "eye"}></ion-icon>
                        </span>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={tempPassword}  // Temp password input
                            onChange={(e) => setTempPassword(e.target.value)}
                            required
                        />
                        <label>Temporary Password</label>
                    </div>

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
                        <label>Confirm Password</label>
                    </div>

                    <button type="submit">Reset Password</button>
                </form>
            </div>
        </div>
    );
}
