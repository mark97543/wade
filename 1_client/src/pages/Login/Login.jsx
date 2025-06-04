import React from 'react'
import './Login.css'

function Login() {
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

        <form className='form_box'>
            <h3>Welcome Back</h3>
            <label for='login_input'>Email</label>
            <input id='login_input' type='email'></input>
            <label for='login_password'>Password</label>
            <input type='password' id='login_password'></input>
            <button className='login_button_page'>Log In</button>
        </form>
        
    </div>
  )
}

export default Login
