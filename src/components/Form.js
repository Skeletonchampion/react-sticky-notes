import '../App.css';
import React from "react";

import loadingGif from "../images/Spinner-1s-200px.svg";

const axios = require('axios');
axios.defaults.withCredentials = true;

const BACKEND_BASE_URL = "https://backend-reactnotes.herokuapp.com";

export default function Form({navigate, setNotes}) {
    const [message, setMessage] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const usernameRef = React.useRef("");
    const passwordRef = React.useRef("");
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if(!usernameRef.current.value || !passwordRef.current.value) return setMessage("Please enter your username and password!");
      try {
        setIsLoading(true);
        setNotes([]);
        setMessage("");
        const res = await axios.post(`${BACKEND_BASE_URL}/login`, {
          username: usernameRef.current.value,
          password: passwordRef.current.value,
        });
  
        setIsLoading(false);
        setMessage(res.data.message);
        if(res.data.userId) {
          navigate("/notes");
        }
      }
      catch(err) {
        console.error(err);
      }
    }
  
    return (
      <div className='text-center flex justify-center'>
        <div className='mt-6 py-6 px-5 flex flex-col items-center'>
        <div className='mb-4'>Welcome to my react-notes!</div>
          <form onSubmit={handleSubmit} className='mb-4 w-64 flex flex-col'>
            <input className='py-1 px-2 w-full mb-2 border border-gray-400 outline-none' ref={usernameRef} placeholder='username' name="username"></input>
            <input className='py-1 px-2 w-full mb-8 border border-gray-400 outline-none' type="password" ref={passwordRef} placeholder='password' name="password"></input>
            <button
              className='py-1 px-2 mb-2 outline-none border border-gray-400 bg-green-400 hover:bg-green-300' type='submit'
              >
            Login/Register
            </button>
          </form>
          <div className="flex-grow">
            {message
            ?
            (message === "Wrong password!"
              ?
              <span className="text-red-500 font-bold">{message}</span>
              :
              message === "Please enter your username and password!"
                ?
                <span className='text-red-500 font-bold'>{message}</span>
                :
                <span className='text-green-400 font-bold'>{message}</span>)
            :
            ""
            }
            {isLoading
            ?
            <div className='flex flex-col items-center'>
              <img className='w-8 h-8 md:w-10 md:h-10' src={loadingGif} alt="loading.icon"></img>
              <span>This will take a while</span>
            </div>
            :
            ""
            }
          </div>
        </div>
      </div>
    );
}