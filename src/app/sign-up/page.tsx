'use client'
import { useState } from 'react';
import {useCreateUserWithEmailAndPassword, useSignInWithEmailAndPassword} from 'react-firebase-hooks/auth'
import { auth, db } from '../../../firebase/config'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TabsContent } from '@radix-ui/react-tabs';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  const router = useRouter()

  const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);
  const [signUserIn] = useSignInWithEmailAndPassword(auth);

  const handleSignUp = async () => {
    try {
        console.log({email, password, firstName, lastName, cardNumber})
        const res = await createUserWithEmailAndPassword(email, password)
        if (!res) return
        const uid = res.user.uid
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, {
          cardNumber: parseInt(cardNumber),
          firstName: firstName,
          lastName: lastName,
          totalSpend: 0
        })
        // sessionStorage.setItem('user', true)
        setEmail('')
        setPassword('')
        setFirstName('')
        setLastName('')
        setCardNumber('')
        router.push('/info-view')
    } catch(e){
        console.error(e)
    }
  };

  const handleSignIn = async () => {
    try {
        console.log({email, password})
        const res = await signUserIn(email, password)
        console.log({res})
        if (!res) return
        router.push('/info-view')
        // sessionStorage.setItem('user', true)
        setEmail('')
        setPassword('')
    } catch(e){
        console.error(e)
    }
  }

  return (
    <Tabs defaultValue='signup' className="min-h-screen mt-8 bg" >
      <div className='max-w-xl mx-auto flex flex-col gap-4'>
      <p className='font-medium text-xl hover:cursor-pointer hover:underline' onClick={() => {
        router.push('/info-view')
      }}>{"< Back"}</p>
      <div className="bg-foreground p-10 rounded-lg shadow-xl ">
      <TabsList>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
        <TabsTrigger value="signin">Sign In</TabsTrigger>
      </TabsList>
      <TabsContent value='signup' className='mt-4'>
          <div className='flex gap-3'>
          <input 
            type="text" 
            placeholder="First Name" 
            value={firstName} 
            onChange={(e) => setFirstName(e.target.value)} 
            className="w-full p-3 mb-4 bg-background rounded outline-none text-foreground placeholder:text-gray-foreground"
          />
          <input 
            type="text" 
            placeholder="Last Name" 
            value={lastName} 
            onChange={(e) => setLastName(e.target.value)} 
            className="w-full p-3 mb-4 bg-background rounded outline-none text-foreground placeholder:text-gray-foreground"
          />
          </div>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full p-3 mb-4 bg-background rounded outline-none text-foreground placeholder:text-gray-foreground"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full p-3 mb-4 bg-background rounded outline-none text-foreground placeholder:text-gray-foreground"
          />
          <input 
            type="text" 
            placeholder="Last 4 digits of card" 
            value={cardNumber} 
            onChange={(e) => setCardNumber(e.target.value)} 
            className="w-full p-3 mb-4 bg-background rounded outline-none text-foreground placeholder:text-gray-foreground"
          />
          <button 
            onClick={handleSignUp}
            className="w-full p-3 mt-3 bg-foreground rounded text-background hover:bg-background hover:text-foreground"
          >
            Sign Up
          </button>
      </TabsContent>
      <TabsContent value='signin' className='mt-4'>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full p-3 mb-4 bg-background rounded outline-none text-foreground placeholder:text-gray-foreground"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full p-3 mb-4 bg-background rounded outline-none text-foreground placeholder:text-gray-foreground"
          />
          <button 
            onClick={handleSignIn}
            className="w-full p-3 mt-3 bg-foreground rounded text-background hover:bg-background hover:text-foreground"
          >
            Sign In
          </button>
      </TabsContent>
      </div>
      </div>
    </Tabs>
  );
};

export default SignUp;