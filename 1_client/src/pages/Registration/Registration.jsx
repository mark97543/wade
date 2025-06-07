import React, {useState, useEffect} from 'react'
import './Registration.css'
import { useAuth } from '@wade-usa/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createDirectus, createUsers } from '@directus/sdk'; 




function Registration() {
    


    const [password, setPassword]=useState('')
    const [passwordCheck, setPasswordCheck]=useState('')
    const [passwordMessage, setPasswordMessage]=useState('Re-enter Password')
    const [loading, setLoading]=useState(false)
    const [error, setError]=useState('')
    const [email, setEmail]=useState('')
    const [userName, setUserName]=useState('')

    const {register} = useAuth() ///Gets Register function 

    const changePassword = (e)=>{
        setPassword(e.target.value)       
    }
    
    const changeCheckPassword = (e) =>{
        setPasswordCheck(e.target.value)
    }



    // Password Verification 
    useEffect(()=>{

        if(!password || !passwordCheck){
            setPasswordMessage('Re-enter Password')
            return
        }else if(password !== passwordCheck){
            setPasswordMessage('Error: Passwords Must Match')
            return
        }else if(password === passwordCheck){
            setPasswordMessage('Passwords Match!')
            return
        }

    },[password, passwordCheck])

    const handleSubmit = async (e) =>{
        e.preventDefault() //This will stop page from reloading on submit. 
        console.log('1. handleSubmit started.'); 

        setLoading(true)

        if(password !== passwordCheck){
            setError('Passwords Do Not Match')
            setLoading(false)
            return
        }else if(!userName){
            setError('User Name is required')
            setLoading(false)
            return
        }else if(!email){
            setError('Email is required')
            setLoading(false)
            return
        }else if(!password){
            setError('Password is required')
            setLoading(false)
            return
        }else{
            setError('')
        }

        try{
            const userData = {
                first_name:userName,
                last_name:'default',
                email:email,
                password:password,
            }
            
            console.log('2. Calling register with this data:', userData); 
            await register(userData) //Send Combined information to directus
            console.log('4. Registration call completed WITHOUT an error.');

        }catch(error){
            setError(error.message ||'Failed to Register')
            console.error('5. Caught an error in the component:', error);
        }finally{
            setLoading(false)
        }

    }


  return (
    <div>
        <p>Need Dmv Video here</p>

    
        <form className='form_box' onSubmit={handleSubmit}>
            <h3>Register Here</h3>

            <p className='reg_error'>{error ? `Error: ${error}` : ''}</p>
            
            <label htmlFor='reg_username'>Username</label>
            <input id='reg_username' type='text' onChange={(e)=>setUserName(e.target.value)} value={userName}></input>
            
            <label htmlFor='reg_email'>Email</label>
            <input id='reg_email' type='email' onChange={(e)=>setEmail(e.target.value)} value={email}></input>

            <label htmlFor='reg_pass'>Password</label>
            <input id='reg_pass' type='password' onChange={(e)=>changePassword(e)} value={password}></input>

            <label htmlFor='reg_pass_confirm'>{passwordMessage}</label>
            <input id='reg_pass_confirm' type='password' onChange={(e)=>changeCheckPassword(e)} value={passwordCheck}></input>

            <button type='submit' disabled={loading} className='login_button_page'>{loading ? 'Registering ....': 'Create Account'}</button>

        </form>


    </div>
  )

}


export default Registration
