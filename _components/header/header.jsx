import React from 'react';
import './header.css'; // <-- Added CSS import here!

const Header = ({ message = "Hello from header!" }) => {
  return (
    <header className='header_container'>
      <div className='header_logo'>
        <a href='#'>M+S </a>
      </div>


    </header>
  );
};

export default Header;
