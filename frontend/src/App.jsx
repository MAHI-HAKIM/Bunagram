import { useEffect, useState } from 'react'
import Navbar from "./components/Navbar";
import { Routes, Route , Navigate } from "react-router-dom";

import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Setting from './pages/Setting'
import Profile from './pages/Profile'
import { axiosInstance } from './lib/axios';
import { useAuthStore } from './store/useAuthStore';
import {Loader} from "lucide-react"

function App() {

  const {authUser,checkAuth,isCheckingAuth} = useAuthStore();

  useEffect(()=>{
    checkAuth();
  },[checkAuth]);


 if(isCheckingAuth && !authUser) return (
   <div className = "flex items-center justify-center h-screen">
     <Loader className="size-10 animate-spin"/>
   </div>
 )
  

  return (
  <div >
    <Navbar />

    <Routes>
      <Route path="/" element={authUser? <Home /> : <Navigate to = "/login"/>} />
      <Route path="/signup" element={!authUser ? <Signup /> : <Navigate to="/"/>} />
      <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/"/>} />
      <Route path="/setting" element={<Setting />} />
      <Route path="/profile" element={authUser? <Profile /> :  <Navigate to = "/login"/>} />
    </Routes>

  </div>
  );
}

export default App
