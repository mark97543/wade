import { useState } from 'react'
import './App.css'
import Header from '@wade-usa/components/header/header.jsx'
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import Page404 from './pages/404 page/404NotFound';
import Home from './pages/Home/Home';
import Docker from './pages/Dock/Docker';
import Login from './pages/Login/Login';
import { AuthProvider } from '@wade-usa/contexts/AuthContext'; // NEW: Use the alias for shared context
import ProtectedRoute from '@wade-usa/components/ProtectedRoute/ProtectedRoute.jsx'
import Goodbye from './pages/Goodbye/Goodbye';
import Registration from './pages/Registration/Registration';
import Forbbiden from './pages/forbidden/Forbbiden';
import Pending_User from './pages/Pending_User/Pending_User';


function App() {

  return (
    <div className='wrapper'>
      <Router basename='/'>
        <AuthProvider>
          <Header/>
          <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path='/goodbye' element={<Goodbye/>}/>
            <Route path='/registration' element={<Registration/>}/>
            <Route path='/forbidden' element={<Forbbiden/>}/>
            <Route path='/*' element={<Page404/>}/> 

            {/* Protected Routes*/}

            <Route path = '/dock' element={<ProtectedRoute><Docker/></ProtectedRoute>}/>
            <Route path='/pending' element={<ProtectedRoute><Pending_User/></ProtectedRoute>}/>


          </Routes>
        </AuthProvider>
      </Router>
    </div>
  )
}

export default App

//TODO: Need to use Protected Routes
