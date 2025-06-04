import React from 'react';
import './header.css'; // <-- Added CSS import here!

const Header = ({ message = "Hello from header!" }) => {
  return (
    <header className='header_container'>
      <div className='header_logo'>
        <a href='/'>M+S </a> {/* TODO: Need this to go to dashboard if logged in*/}
      </div>

      <div className='header_right'>
        <button className='logout_button'>Log In</button>
      </div>

    </header>
  );
};

export default Header;

//TODO: Need to use navigate to go to log in screen. 
