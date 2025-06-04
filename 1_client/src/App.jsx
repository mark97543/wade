import { useState } from 'react'
import './App.css'
import Header from '@wade-usa/components/header/header.jsx'
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import Page404 from './pages/404 page/404NotFound';
import Home from './pages/Home/Home';
import Docker from './pages/Dock/Docker';
import Login from './pages/Login/Login';
import { AuthProvider } from '@wade-usa/contexts/AuthContext'; // NEW: Use the alias for shared context



function App() {

  return (
    <div className='wrapper'>

      <Router>
        <AuthProvider>
          <Header/>
          <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path = '/dock' element={<Docker/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path='/*' element={<Page404/>}/> 
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  )
}

export default App

//TODO: Need to use Protected Routes
