// 1_client/src/pages/Login/Login.jsx

import React, { useState, useEffect } from 'react';
import './Login.css';
import { useAuth } from '@wade-usa/contexts/AuthContext'; //
import { useNavigate, Link } from "react-router-dom"; //


// Removed testDirectusClient as it was for the temporary test
// The main directus client is provided via AuthContext


function Login() {
    const [email, setEmail]=useState('')
    const [password, setPassword]=useState('')
    const [loading, setLoading]=useState(false)
    const { login, isLoggedIn, authError } = useAuth(); //
    const navigate = useNavigate(); //

    // Effect to redirect if already logged in or if login succeeds
    useEffect(() => {
        if (isLoggedIn) {
            navigate('/dock'); //
        }
    }, [isLoggedIn, navigate]); //


    const handleSubmit =async(e)=>{
        console.log('!!!!!!! HANDLE SUBMIT CALLED !!!!!!!'); // You can remove this debug log once confirmed
        e.preventDefault();
        setLoading(true);

        // --- ADD THESE LOGS HERE ---
        console.log('!!!!!!! HANDLE SUBMIT CALLED !!!!!!!');
        console.log('--- Values before login attempt ---');
        console.log('Email state value:', email);
        console.log('Password state value:', password);
        // --- END ADDED LOGS ---

        if (!email || typeof email !== 'string' || email.trim() === '') {
            console.error('Validation Error: Email is not a valid string or is empty.');
            // This is just a client-side alert for immediate feedback, AuthContext will also catch it
            alert('Please enter a valid email address.');
            setLoading(false);
            return; // Stop function execution
        }
        if (!password || typeof password !== 'string' || password.trim() === '') {
            console.error('Validation Error: Password is not a valid string or is empty.');
            alert('Please enter your password.');
            setLoading(false);
            return; // Stop function execution
        }
        // --- END ADDED VALIDATION AND LOGGING ---


        try {
            await login(email, password);
            // If login is successful, useEffect will handle redirection
        } catch (err) {
            console.error('Login failed in Login.jsx component:', err); //
            // The AuthContext already sets authError, which is displayed on the page.
            // You can optionally parse the error more here if needed, but AuthContext handles display.
        } finally {
            setLoading(false); //
        }
    }

  return (
    <div>
        <div className="login_video">
            <video
                width="100%" // Example: Make it responsive width
                preload="metadata" // Helps load dimensions/duration quickly
                autoPlay
                loop
                muted
                playsInline
            >
                <source src='https://api.wade-usa.com/uploads/Login_Video_b01f36a100.mp4' type="video/mp4" /> //
                Your browser does not support the video tag. Please update your browser.
            </video>
        </div>

        <form className='form_box' onSubmit={handleSubmit}>
            <h3>Welcome Back</h3>
            {/* Display authError from context */}
            {(authError) && <p className="reg_error">{`Error: ${authError}`}</p>}
            <label htmlFor='login_input'>Email</label>
            {/* Value attribute added to ensure input is controlled by state */}
            <input id='login_input' type='email' onChange={(e) => setEmail(e.target.value)} value={email} required disabled={loading}></input>
            <label htmlFor='login_password'>Password</label>
            {/* Value attribute added to ensure input is controlled by state */}
            <input type='password' id='login_password' onChange={(e) => setPassword(e.target.value)} value={password} required disabled={loading}></input>
            <button type='submit' disabled={loading} className='login_button_page' >{loading ? 'Logging In...' : 'Login'}</button>
        </form>

        <div className='login_Register'>
            <Link to='/registration'>Register New User</Link>
        </div>

    </div>
  )
}

export default Login