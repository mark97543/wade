import React from 'react'
import './Goodbye.css'

function Goodbye() {
  return (
    <div className='goodbye_wrapper'>
        <h2>Goodbye</h2>
        <div className="goodbye_video">
        <video
            width="100%" // Example: Make it responsive width
            preload="metadata" // Helps load dimensions/duration quickly
            autoPlay
            loop
            muted
            playsInline
        >
            <source src='https://api.wade-usa.com/uploads/Goodbye_Video_cc8d660a7b.mp4' type="video/mp4" />
            Your browser does not support the video tag. Please update your browser.
        </video>
    </div>
    </div>
  )
}

export default Goodbye
