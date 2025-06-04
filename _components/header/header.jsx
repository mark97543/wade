import React from 'react';
import './header.css'; // <-- Added CSS import here!
import { useNavigate } from "react-router-dom";
import { useAuth } from '@wade-usa/contexts/AuthContext'; // NEW: Use the alias for shared context


const Header = ({ message = "Hello from header!" }) => {
  
  const navigate = useNavigate(); 
  const { isLoggedIn, user, logout } = useAuth();


  const handleLoginClick = () => {
    //navigate('/login');
    window.location.href ='/login' 
  };

  const handleLogout = ()=>{
    logout()
    //navigate('/login');
    window.location.href = '/goodbye'  
  }

  return (
    <header className='header_container'>
      <div className='header_logo'>
        <a href='/'>M+S </a> {/* TODO: Need this to go to dashboard if logged in*/}
      </div>

      <div className='header_right'>
        {isLoggedIn ?(
          <>
            <button className='logout_button' onClick={handleLogout}>Logout</button>
          </>
        ): (
          <button className='logout_button' onClick={handleLoginClick}>Login</button>
        )}
      </div>

    </header>
  );
};

export default Header;

//TODO: Need to use navigate to go to log in screen. 
