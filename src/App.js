import './App.css';
import React from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import uniqid from "uniqid";
import {DateTime} from "luxon";
import Countdown from 'react-countdown';
const axios = require('axios');
axios.defaults.withCredentials = true;

const BACKEND_BASE_URL = "https://sc-backend-reactnotes.netlify.app";

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

function Notes({notes, setNotes, navigate, username, setUsername}) {
  const [user, setUser] = React.useState(false);
  
  React.useEffect(() => {
    isAuth();
    getNotes();
  }, [notes]);

  async function isAuth() {
    const res = await axios.get(`${BACKEND_BASE_URL}/user`);

    if(!res.data.userId) {
      navigate("/");
    }
    else {
      setUser(true);
      setUsername(res.data.username);
    }
  }

  async function getNotes() {
    const res = await axios.get(`${BACKEND_BASE_URL}/notes`);
    const sortedNotes = res.data;
    sortedNotes.sort((a, b) => {
        return a.ts - b.ts;
    });
    setNotes(sortedNotes);
  }

  const handleLogout = async () => {
    try {
      const res = await axios.delete(`${BACKEND_BASE_URL}/logout`);
      navigate("/");
    }
    catch(err) {
      console.error(`error: ${err}`);
    }
  }

  return (
    <>
      {user 
        ? 
        <div className='min-w-screen grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {notes.map(note => (
            <Note key={note.noteId} note={note} notes={notes} setNotes={setNotes}/>
          ))}
          <div className='fixed bottom-2 left-2'>
            <div className='inline-block mr-4 text-lg font-bold text-red-400'>Username: {username}</div>
            <button className='outline-none p-2 bg-gray-400' onClick={handleLogout}>Logout</button>
          </div>
          <New notes={notes} setNotes={setNotes} />
        </div>
        : 
        <div></div>}
    </>
  );
}

function Note({note, notes, setNotes}) {
  const [color, setColor] = React.useState("");
  const [state, setState] = React.useState(note.title);
  const [colorForm, setColorForm] = React.useState(false);
  const [colors, setColors] = React.useState([
    "red", "yellow", "blue", "green", "purple",
  ]);

  const bgColor = `bg-${color}-400`;
  const bgNoteBg = `bg-${note.bg}-400`;

  async function handleChangeColor(color) {
    setColor(color);
    setColorForm(!colorForm);
    await axios.patch(`${BACKEND_BASE_URL}/notes/note`, {noteId: note.noteId ,color: color});
  }

  const now = DateTime.now();
  const goal = DateTime.fromSQL(note.date);
  let diff = ((goal.ts - now.ts) /1000).toFixed();

  const c = goal.c;

  const date = DateTime.fromObject({year: c.year, month: c.month, day: c.day,}).toFormat("dd-MM-yyyy");
  const time = DateTime.fromObject({hour: c.hour, minute: c.minute, second: c.second,}).toFormat("HH'h':mm'm'")

  const renderer = ({days, hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a completed state
      return <span className='text-2xl font-medium underline'>DONE!</span>;
    } else {
      // Render a countdown
      return <div className='w-[15ch] text-right'>
        <span className='text-lg'>{hours >= 10 ? hours : `0${hours}`}h</span><span>:</span>
        <span className='text-lg'>{minutes >= 10 ? minutes : `0${minutes}`}m</span><span>:</span>
        <span className='text-lg'>{seconds >= 10 ? seconds : `0${seconds}`}s</span>
        <div><span className='text-3xl font-bold'>{days} <span className='text-base font-normal'>days left</span></span></div>
      </div>;
    }
  };

  const handleDelete = async () => {
    const deletedNote = await axios.delete(`${BACKEND_BASE_URL}/notes/note`, {data: {noteId: note.noteId}});

    const newNotes = [...notes];
    const index = newNotes.indexOf(note);
    newNotes.splice(index, 1);
    setNotes(newNotes);
  }
  
  return (
    <div className={`mr-2 mb-2 px-2 pt-2 pb-4 ${color ? bgColor : bgNoteBg} relative border border-gray-400 shadow-sm flex flex-col`}>
      <div onClick={handleDelete} className="w-5 h-5 absolute top-0 right-0 cursor-pointer">
        <img src="https://img.icons8.com/emoji/48/000000/cross-mark-emoji.png" alt="cross.icon"/>
      </div>
      <div>
        <div className='mb-1 flex flex-col border-black border-b'>
          <h1 className='mb-2 mr-4 font-bold text-lg whitespace-normal break-words'>{note.title}</h1>
          <div className='mb-3 whitespace-normal break-words'>{note.body}</div>
        </div>
        <div className='flex justify-between mb-4'>
          <div>
            <div>{date}</div>
            <div>{time}</div>
          </div>
          <div className=''>
            <Countdown date={Date.now() + diff*1000} renderer={renderer} />
          </div>
        </div>
      </div>
      {colorForm 
      ? 
      <div className="flex py-1 absolute bottom-0 left-1">
        <label htmlFor={`${note.noteId}${colors[0]}`} className={`inline-block w-8 h-8 border border-black rounded-full mr-2 bg-${colors[0]}-400 transform hover:scale-105 cursor-pointer`}></label>
        <input className="hidden" onClick={(e) => {
          handleChangeColor(e.target.value)
        }} type="radio" name="color" id={`${note.noteId}${colors[0]}`} value={`${colors[0]}`}></input>
      
        <label htmlFor={`${note.noteId}${colors[1]}`} className={`inline-block w-8 h-8 border border-black rounded-full mr-2 bg-${colors[1]}-400 transform hover:scale-105 cursor-pointer`}></label>
        <input className="hidden" onClick={(e) => {
          handleChangeColor(e.target.value);
        }} type="radio" name="color" id={`${note.noteId}${colors[1]}`} value={`${colors[1]}`}></input>

        <label htmlFor={`${note.noteId}${colors[2]}`} className={`inline-bl ock w-8 h-8 border border-black rounded-full mr-2 bg-${colors[2]}-400 transform hover:scale-105 cursor-pointer`}></label>
        <input className="hidden" onClick={(e) => {
          handleChangeColor(e.target.value);
        }} type="radio" name="color" id={`${note.noteId}${colors[2]}`} value={`${colors[2]}`}></input>

        <label htmlFor={`${note.noteId}${colors[3]}`} className={`inline-block w-8 h-8 border border-black rounded-full mr-2 bg-${colors[3]}-400 transform hover:scale-105 cursor-pointer`}></label>
        <input className="hidden" onClick={(e) => {
          handleChangeColor(e.target.value);
        }} type="radio" name="color" id={`${note.noteId}${colors[3]}`} value={`${colors[3]}`}></input>

        <label htmlFor={`${note.noteId}${colors[4]}`} className={`inline-block w-8 h-8 border border-black rounded-full mr-2 bg-${colors[4]}-400 transform hover:scale-105 cursor-pointer`}></label>
        <input className="hidden" onClick={(e) => {
          handleChangeColor(e.target.value);
        }} type="radio" name="color" id={`${note.noteId}${colors[4]}`} value={`${colors[4]}`}></input>
      </div> 
      : 
      <div onClick={() => setColorForm(!colorForm)} className='w-[fit-content] h-1 py-2 px-1 absolute bottom-2 left-2 flex justify-center items-center cursor-pointer'>
        <div className='h-1 w-1 mx-[2px] rounded-full bg-black'></div>
        <div className='h-1 w-1 mx-[2px] rounded-full bg-black'></div>
        <div className='h-1 w-1 mx-[2px] rounded-full bg-black'></div>
      </div>}
    </div>
  )
}

function New({notes, setNotes}) {
  const [form, setForm] = React.useState(false);
  const titleRef = React.useRef();
  const bodyRef = React.useRef();
  const [hour, setHour] = React.useState(0);
  const [minute, setMinute] = React.useState(0);
  const dateRef = React.useRef();
  const formRef = React.useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const dateInput = DateTime.fromISO(dateRef.current.value).toFormat("yyyy-MM-dd");
        const dateObject = DateTime.fromISO(dateRef.current.value);

        // let [hour, minute] = [hourRef.current.value, minuteRef.current.value];
        // if(hour < 10) hour = `0${hour}`;
        // if(minute < 10) minute = `0${minute}`;
        const timeInput = DateTime.fromISO(`${hour < 10 ? `0${hour}` : hour}:${minute < 10 ? `0${minute}` : minute}:00`).toFormat("HH:mm:ss");

        const date = `${dateInput} ${timeInput}`;

        const tsDate = (dateObject.c.year*365*24*60*60) + (dateObject.c.month*30*24*60*60) + (dateObject.c.day*24*60*60);
        const tsTime = (hour*60*60) + (minute*60);
        const ts = tsDate + tsTime;

        const res = await axios.post(`${BACKEND_BASE_URL}/notes/new`, {
          title: titleRef.current.value,
          body: bodyRef.current.value,
          date: date,
          noteId: uniqid(),
          ts: ts,
        });

        setForm(!form);

        const sortedNotes = [...notes, res.data];
        sortedNotes.sort((a, b) => {
            return a.ts - b.ts;
        });

        setNotes(sortedNotes);
      }
      catch(err) {
        console.error(err);
    }
  }

  return (
    <>
      <div onClick={() => setForm(!form)} className='w-[100px] h-[100px] bg-blue-400 flex flex-col justify-center items-center rounded-full fixed bottom-4 right-4 cursor-pointer'>
        <img className='w-[50px] h-[50px]' src="https://img.icons8.com/ios/50/000000/create-order--v1.png" alt='new-notes.icon'/>
        <div className='font-bold text-lg'>New</div>
      </div>
      {form && 
      <div ref={formRef} className='absolute z-10 bg-white top-10 left-[50%] transform translate-x-[-50%]'>
        <form className='relative flex flex-col' onSubmit={handleSubmit}>
          {/* <div onClick={() => setForm(!form)} className='w-6 h-6 absolute top-0 right-0 cursor-pointer'>
            <img src="https://img.icons8.com/emoji/48/000000/cross-mark-emoji.png" alt="cross.icon"/>
          </div> */}
          <input
            ref={titleRef}
            className='px-2 py-1 bg-gray-300 rounded-sm outline-none'
            placeholder='Title' name='title'
            required></input>
          <textarea ref={bodyRef}
            className="mb-2 px-2 py-1 bg-gray-300 rounded-sm outline-none resize-none"
            placeholder='Your description...'
            cols="30"
            rows="4"
            name="body"></textarea>
          <div className='mb-2 flex flex-col text-center'>
            <input defaultValue="0" className='appearance-none outline-none mb-3 cursor-pointer bg-purple-400 h-1 rounded-full mx-1' onChange={(e) => setHour(e.target.value)} type="range" steps="1" min="0" max="23" name="hour" required></input>
            <input defaultValue="0" className='appearance-none outline-none cursor-pointer bg-purple-400 h-1 rounded-full mx-1' onChange={(e) => setMinute(e.target.value)} type="range" step="1" min="0" max="59" name="minute" required></input>
            <div>{hour >= 10 ? hour : `0${hour}`}h:{minute >= 10 ? minute : `0${minute}`}m</div>
          </div>
          <input
            className='mb-2 px-2 py-1 outline-none text-center'
            ref={dateRef}
            type="date"
            name="date"
            required
            onKeyDown={(e) => e.preventDefault()}
            
            ></input>
          <button className='px-2 py-1 bg-blue-400 hover:bg-blue-500' type="submit">Create</button>
          <button className='px-2 py-1 bg-red-400 hover:bg-red-500' onClick={(e) => {
            e.preventDefault();
            setForm(!form);
          }}>Cancel</button>
        </form>
      </div>}
    </>
  ) 
}

function Form({navigate, setNotes}) {
  const [message, setMessage] = React.useState("");
  const usernameRef = React.useRef();
  const passwordRef = React.useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setNotes([]);
      setMessage("");
      const res = await axios.post(`${BACKEND_BASE_URL}/login`, {
        username: usernameRef.current.value,
        password: passwordRef.current.value,
      });

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
    <div className='flex justify-center'>
      <div className='mt-6 py-6 px-5 h-60 border border-gray-400 border-dashed flex flex-col items-center'>
        <form onSubmit={handleSubmit} className='flex flex-col items-center'>
          <input className='py-1 px-2 mb-2 border border-gray-400 outline-none' ref={usernameRef} placeholder='username' name="username" required></input>
          <input className='py-1 px-2 mb-2 border border-gray-400 outline-none' type="password" ref={passwordRef} placeholder='password' name="password" required></input>
          <button className='py-1 px-2 mb-2 outline-none border border-gray-400' type='submit'>Login/Register</button>
        </form>
        <div className='mb-2'>Rememember your password after registration</div>
        {message !== "Wrong password!" ? <span className='text-green-400 font-bold'>{message}</span> : <span className="text-red-500 font-bold">Wrong password!</span>}
      </div>
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
