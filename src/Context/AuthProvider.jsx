import React, { useEffect,useState } from 'react';
import { firebaseAuth } from '../config/config';

export const AuthContext = React.createContext(); 

export function AuthProvider ({children}){
    const [currentUser,setCurrentUser] =useState(null);
   
    function login(email,password){
       return firebaseAuth.signInWithEmailAndPassword(email,password);
    }

    function signUp(email,password){
        return firebaseAuth.createUserWithEmailAndPassword(email,password);       

    }

    function signOut(){
        firebaseAuth.signOut();
    }
    useEffect(()=>{
        firebaseAuth.onAuthStateChanged((user)=>{
            console.log(user);
            setCurrentUser(user);
        });

    },[]);

    let values ={
        currentUser:currentUser,
        login:login,
        signOut:signOut,
        signUp :signUp,

    }

    return (<AuthContext.Provider value={values}>
        {children}
    </AuthContext.Provider>);

}