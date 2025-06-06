import React from 'react';
import './header.css'; // <-- Added CSS import here!
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '@wade-usa/contexts/AuthContext'; // NEW: Use the alias for shared context

const appName = import.meta.env.VITE_APP_NAME;//Read the environment variable to know which app is running

const Header = ({ message = "Hello from header!" }) => {
  
  const navigate = useNavigate(); 
  const { isLoggedIn, user, logout } = useAuth();


  const handleLoginClick = () => {
    navigate('/login');
    //window.location.href ='/login' 
  };

  const handleLogout = async ()=>{
    
    await logout()
    navigate('/goodbye');
    //window.location.href = '/goodbye'  
  }

  return (
    <header className='header_container'>
      <div className='header_logo'>
        <Link to='/'>M+S </Link> {/* TODO: Need this to go to dashboard if logged in*/}
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




// <nav className='header_nav'>
//   {/* This is the smart link logic:
//     - If we are in the 'client' app, use a regular <a> tag to navigate EXTERNALLY to the blog.
//     - Otherwise (meaning we are in the 'travelBlog' app), use the <Link> component to navigate INTERNALLY to the blog's homepage.
//   */}
//   {appName === 'client' ? (
//     <a href="/travelBlog">Travel Blog</a>
//   ) : (
//     <Link to="/">Travel Blog</Link>
//   )}
// </nav>
