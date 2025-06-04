import React, { useState, useEffect } from 'react';
import './Login.css'
import { createDirectus } from '@directus/sdk'; // Import the factory function
import { useAuth } from '@wade-usa/contexts/AuthContext'; // NEW: Use the alias for shared context
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection



const directus = createDirectus(import.meta.env.VITE_DIRECTUS_URL); // Use the factory function




function Login() {
    const [email, setEmail]=useState('')
    const [password, setPassword]=useState('')
    const [localError, setLocalError]=useState('') // This is correct from previous step
    const [loading, setLoading]=useState(false)
    const { login, isLoggedIn, authError } = useAuth(); // Get login function and auth state from context
    const navigate = useNavigate(); // Get navigate function


    // Effect to redirect if already logged in or if login succeeds
    useEffect(() => {
        if (isLoggedIn) {
            navigate('/'); // Redirect to home page or dashboard upon successful login
        }
    }, [isLoggedIn, navigate]); // Depend on isLoggedIn and navigate


    const handleSubmit =async(e)=>{
        e.preventDefault(); // Prevent default form submission behavior
        setLocalError(''); // Clear any previous errors
        setLoading(true); // Set loading state to true

        try {
            // Call the login function from AuthContext
            await login(email, password);
            // If login is successful, useEffect will handle redirection
        } catch (err) {
            // The error is already set in AuthContext, but we can also display a local error
            console.error('Login failed in Login.jsx component:', err);
            setLocalError(err.message || 'An unknown error occurred during login.');
        } finally {
            setLoading(false); // Reset loading state
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
                <source src='https://01-spaces.sfo3.cdn.digitaloceanspaces.com/b2132981-3bed-438d-9b3d-470d2375c257.mp4' type="video/mp4" />
                Your browser does not support the video tag. Please update your browser.
            </video>
        </div>

        <form className='form_box' onSubmit={handleSubmit}>
            <h3>Welcome Back</h3>
            <label htmlFor='login_input'>Email</label>
            <input id='login_input' type='email' onChange={(e) => setEmail(e.target.value)} required disabled={loading}></input>
            <label htmlFor='login_password'>Password</label>
            <input type='password' id='login_password' onChange={(e) => setPassword(e.target.value)} required disabled={loading}></input>
            <button type='submit' disabled={loading} className='login_button_page' >{loading ? 'Logging In...' : 'Login'}</button>
        </form>

    </div>
  )
}

export default Login
