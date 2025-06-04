
import reactLogo from './assets/react.svg'
import Header from '@wade-usa/components/header/header.jsx'
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import Test from './assets/test page/test';
import { AuthProvider } from '@wade-usa/contexts';

function App() {


  return (
    <>
      <Router basename='/travelBlog'>
        <AuthProvider>
          <Header></Header>
          <Routes>
            <Route path='/' element={<Test/>} />
          </Routes>


        </AuthProvider>
      </Router>
    </>
  )
}

export default App
