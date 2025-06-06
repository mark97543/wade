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
            <source src='https://01-spaces.sfo3.cdn.digitaloceanspaces.com/2ec29ae7-5424-4342-9761-2b12b0b0f092.mp4' type="video/mp4" />
            Your browser does not support the video tag. Please update your browser.
        </video>
    </div>
    </div>
  )
}

export default Goodbye
