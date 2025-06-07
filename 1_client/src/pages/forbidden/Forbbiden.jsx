import React from 'react'
import './Forbidden.css'

function Forbbiden() {
  return (
    <div className='forbidden_wrapper'>
        <div className="forbidden_video">
            <video
                width="100%" // Example: Make it responsive width
                preload="metadata" // Helps load dimensions/duration quickly
                autoPlay
                loop
                muted
                playsInline
            >
                <source src='https://01-spaces.sfo3.cdn.digitaloceanspaces.com/1_client/forbbiden.mp4' type="video/mp4" /> //
                Your browser does not support the video tag. Please update your browser.
            </video>
        </div>
        <h3>Warning:</h3>
        <p>Your Delicate Mind Could not Possibly Fathom Whats On This Page</p>
    </div>
  )
}

export default Forbbiden
