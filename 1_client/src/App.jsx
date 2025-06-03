import { useState } from 'react'
import './App.css'
import Header from '@wade-usa/components/header/header.jsx'
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import Page404 from './pages/404 page/404NotFound';

function App() {

  return (
    <div className='wrapper'>
      <Header/>
      <Router>
        <Routes>
          
          <Route path='/*' element={<Page404/>}/> {/* 404 Page for all pages that do not exist*/}
        </Routes>
      </Router>

      <h1>Not Logged In</h1>


    </div>
  )
}

export default App
