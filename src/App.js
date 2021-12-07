import './App.css';
import React from "react";
import { useNavigate, Routes, Route } from "react-router-dom";

import Notes from "./components/Notes.js";
import Form from './components/Form';

const axios = require('axios');
axios.defaults.withCredentials = true;

const BACKEND_BASE_URL = "https://backend-reactnotes.herokuapp.com";

function App() {
  const [notes, setNotes] = React.useState([]);
  const [username, setUsername] = React.useState("");
  const navigate = useNavigate();

  return (
    <div className="App p-2">
      <Routes>
        <Route path="*" element={<ErrorPage navigate={navigate} />}></Route>
        <Route path="/" element={<Form navigate={navigate} setNotes={setNotes}/>}></Route>
        <Route path="/notes" element={<Notes notes={notes} setNotes={setNotes} navigate={navigate} username={username} setUsername={setUsername}/>}></Route>
      </Routes>
    </div>
  );
}

function ErrorPage({navigate}) {
  const handleReturn = () => {
    navigate("/");
  }

  return(
    <div>
      <div>404 Error!</div>
      <button className='outline-none border border-black' onClick={handleReturn}>Go Back</button>
    </div>
  )
}

export default App;
