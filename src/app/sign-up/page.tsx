'use client'
import { useState } from 'react';
import {useCreateUserWithEmailAndPassword, useSignInWithEmailAndPassword} from 'react-firebase-hooks/auth'
import { auth } from '../firebase/config'

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);
  const [signUserIn] = useSignInWithEmailAndPassword(auth);

  const handleSignUp = async () => {
    try {
        console.log({email, password})
        const res = await createUserWithEmailAndPassword(email, password)
        console.log({res})
        // sessionStorage.setItem('user', true)
        setEmail('')
        setPassword('')
    } catch(e){
        console.error(e)
    }
  };

  const handleSignIn = async () => {
    try {
        console.log({email, password})
        const res = await signUserIn(email, password)
        console.log({res})
        // sessionStorage.setItem('user', true)
        setEmail('')
        setPassword('')
    } catch(e){
        console.error(e)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
        <h1 className="text-white text-2xl mb-5">Sign Up</h1>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />
        <button 
          onClick={handleSignIn}
          className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
        >
          Sign In
        </button>
        <button 
          onClick={handleSignUp}
          className="w-full p-3 mt-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default SignUp;