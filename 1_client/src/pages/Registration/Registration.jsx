import React, {useState, useEffect} from 'react'
import './Registration.css'

function Registration() {
    
    const [password, setPassword]=useState('')
    const [passwordCheck, setPasswordCheck]=useState('')
    const [passwordMessage, setPasswordMessage]=useState('Re-enter Password')

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


  return (
    <div>
        <p>Need Dmv Video here</p>

    
        <form className='form_box'>
            <h3>Register Here</h3>
            
            <label htmlFor='reg_username'>Username</label>
            <input id='reg_username' type='text'></input>
            
            <label htmlFor='reg_email'>Email</label>
            <input id='reg_email' type='email'></input>

            <label htmlFor='reg_pass'>Password</label>
            <input id='reg_pass' type='password' onChange={(e)=>changePassword(e)} value={password}></input>

            <label htmlFor='reg_pass_confirm'>{passwordMessage}</label>
            <input id='reg_pass_confirm' type='password' onChange={(e)=>changeCheckPassword(e)} value={passwordCheck}></input>

        </form>

    </div>
  )

}


export default Registration
