import React, { useState } from 'react';
import { useAuth } from '@wade-usa/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Registration.css'; // Ensure this CSS file exists and is imported

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, isLoggedIn } = useAuth(); // Get register function from context
    const navigate = useNavigate();

    // Redirect if already logged in
    if (isLoggedIn) {
        navigate('/dock'); // Or wherever your dashboard page is
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        setLoading(true);

        if (password !== confirmPassword) {
            setLocalError('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            // The 'register' function in AuthContext expects a userData object
            await register({ email, password }); // Pass email and password
            console.log('Registration successful! Redirecting to dock...');
            navigate('/dock'); // Redirect to dashboard after successful registration
        } catch (err) {
            console.error('Registration failed in Register.jsx component:', err);
            setLocalError(err.message || 'An unknown error occurred during registration.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='wrapper register_wrapper'>
            <div className="reg_video">
                <video
                    width="100%" // Example: Make it responsive width
                    preload="metadata" // Helps load dimensions/duration quickly
                    autoPlay
                    loop
                    muted
                    playsInline
                >
                    <source src='https://api.wade-usa.com/uploads/Register_Cat_1146a0e3bf.mp4' type="video/mp4" />
                    Your browser does not support the video tag. Please update your browser.
                </video>
            </div>
            <h2>Register for an Account</h2>
            <form className='form_box' onSubmit={handleSubmit}>
                <label htmlFor='register_email'>Email</label>
                <input
                    id='register_email'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                />

                <label htmlFor='register_password'>Password</label>
                <input
                    id='register_password'
                    type='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                />

                <label htmlFor='confirm_password'>Confirm Password</label>
                <input
                    id='confirm_password'
                    type='password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                />

                {localError && <p className="error-message">{localError}</p>}

                <button type='submit' disabled={loading} className='register_button_page'>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    );
}

export default Register;