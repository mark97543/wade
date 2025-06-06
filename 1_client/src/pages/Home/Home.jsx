import React from 'react'
import './Home.css'


function Home() {
  return (
    <div className='wrapper home_wrapper'>
        <h2>Welcome to the wonderfull world of M + S Wade</h2>
        <div className="Home_video">
            <video
                width="100%" // Example: Make it responsive width
                preload="metadata" // Helps load dimensions/duration quickly
                autoPlay
                loop
                muted
                playsInline
            >
                <source src='https://01-spaces.sfo3.cdn.digitaloceanspaces.com/7609260b-ca6d-4601-bc7c-aaaf34cdd1d2.mp4' type="video/mp4" />
                Your browser does not support the video tag. Please update your browser.
            </video>
        </div>
    </div>
  )
}

export default Home
