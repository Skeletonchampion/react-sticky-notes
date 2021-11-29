import './App.css';
import React from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import uniqid from "uniqid";
import {DateTime} from "luxon";
import Countdown from 'react-countdown';
import DatePicker from 'react-datepicker';

import loadingGif from "./images/Spinner-1s-200px.svg";
import next from "./images/icons8-next-50.png";
import previous from "./images/icons8-previous-50.png";

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
        <div className='min-w-screen pb-[160px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {notes.map(note => (
            <Note key={note.noteId} note={note} notes={notes} setNotes={setNotes}/>
          ))}
          <div className='w-full bg-white fixed bottom-0 left-0 right-0 z-50'>
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
        <label htmlFor={`${note.noteId}${colors[0]}`} className={`inline-block w-8 h-8 border border-black rounded-full mr-2 bg-red-400 transform hover:scale-105 cursor-pointer`}></label>
        <input className="hidden" onClick={(e) => {
          handleChangeColor(e.target.value)
        }} type="radio" name="color" id={`${note.noteId}${colors[0]}`} value={`${colors[0]}`}></input>
      
        <label htmlFor={`${note.noteId}${colors[1]}`} className={`inline-block w-8 h-8 border border-black rounded-full mr-2 bg-yellow-400 transform hover:scale-105 cursor-pointer`}></label>
        <input className="hidden" onClick={(e) => {
          handleChangeColor(e.target.value);
        }} type="radio" name="color" id={`${note.noteId}${colors[1]}`} value={`${colors[1]}`}></input>

        <label htmlFor={`${note.noteId}${colors[2]}`} className={`inline-bl ock w-8 h-8 border border-black rounded-full mr-2 bg-blue-400 transform hover:scale-105 cursor-pointer`}></label>
        <input className="hidden" onClick={(e) => {
          handleChangeColor(e.target.value);
        }} type="radio" name="color" id={`${note.noteId}${colors[2]}`} value={`${colors[2]}`}></input>

        <label htmlFor={`${note.noteId}${colors[3]}`} className={`inline-block w-8 h-8 border border-black rounded-full mr-2 bg-green-400 transform hover:scale-105 cursor-pointer`}></label>
        <input className="hidden" onClick={(e) => {
          handleChangeColor(e.target.value);
        }} type="radio" name="color" id={`${note.noteId}${colors[3]}`} value={`${colors[3]}`}></input>

        <label htmlFor={`${note.noteId}${colors[4]}`} className={`inline-block w-8 h-8 border border-black rounded-full mr-2 bg-purple-400 transform hover:scale-105 cursor-pointer`}></label>
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
      <div className='absolute top-0 left-0 z-0 bg-yellow-400 bg-green-400'></div>
    </div>
  )
}

function New({notes, setNotes}) {
  const [form, setForm] = React.useState(false);
  const [title, setTitle] = React.useState(false);
  const [body, setBody] = React.useState(false);

  const titleRef = React.useRef("");
  const bodyRef = React.useRef("");
  const dateRef = React.useRef();
  const timeRef = React.useRef();
  const formRef = React.useRef();
  const [startDate, setStartDate] = React.useState(new Date());

  let hour, minute;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        if(!startDate) return;
        const [month, day, year] = [startDate.getMonth()+1, startDate.getDate(), startDate.getFullYear()];
        [hour, minute] = timeRef.current.value.split(":");
        if(hour == undefined || minute == undefined) {
          hour = "00";
          minute = "00";
        }
        const dateInput = `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
        const timeInput = `${hour}:${minute}:00`;

        hour = parseInt(hour);
        minute = parseInt(minute);

        const date = `${dateInput} ${timeInput}`;

        const tsDate = (year*365*24*60*60) + (month*30*24*60*60) + (day*24*60*60);
        const tsTime = (hour*60*60) + (minute*60);
        const ts = tsDate + tsTime;

        setForm(false);

        const res = await axios.post(`${BACKEND_BASE_URL}/notes/new`, {
          title: titleRef.current.value,
          body: bodyRef.current ? bodyRef.current.value : "",
          date: date,
          noteId: uniqid(),
          ts: ts,
        });

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
      <div id="new" className='relative mr-2 mb-2 min-h-[150px] border border-dashed border-gray-400 shadow-sm'>
        {form
        ?
        <div id="hidden" className='px-2 pt-2 pb-4 relative flex flex-col'>
          <div className='mb-1 opacity-100 flex flex-col border-black border-b'>
            {!title
            ?
            <h1
              onClick={() => {
                setTitle(true);
              }}
              className='mb-2 mr-4 font-bold text-lg whitespace-normal break-words'>title</h1>
            :
            <input
              ref={titleRef} autoFocus
              className='px-2 py-1 rounded-sm outline-none'
              name='title'
              placeholder='Title is required'
              onBlur={(e) => {
                if(!titleRef.current.value) {
                  setTitle(false);
                }
              }}
              required>
            </input>}
            {!body
            ?
            <div 
              onClick={() => {
                setBody(true);
              }}
              className='mb-3 whitespace-normal break-words'>description
            </div>
            :
            <textarea ref={bodyRef}
              className="mb-2 px-2 py-1 rounded-sm outline-none resize-none"
              onBlur={() => {
                if(!bodyRef.current.value) {
                  setBody(false);
                }
              }}
              autoFocus
              cols="30"
              rows="4"
              name="body">
            </textarea>}
          </div>
          <div className='opacity-100 flex justify-between mb-4'>
            <div>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                withPortal
                placeholderText='Date is required'
              />
              <div className='mt-2'>
                <input ref={timeRef} required defaultValue="14:07" name="time" className='border border-gray-400 px-2 py-1' type="time"></input>
              </div>
            </div>
          </div>
          <div className='flex'>
            <button
              className='px-2 py-1 mr-2 outline-none border border-gray-400 hover:bg-yellow-500'
              onClick={() => setForm(false)}>
              Hide
            </button>
            <button
              className='px-2 py-1 outline-none border border-gray-400 hover:bg-green-400' onClick={handleSubmit}>Create</button>
          </div>
        </div>
        :
        <button className='absolute bottom-2 left-2 px-2 py-1 border hover:border-gray-400' onClick={() => setForm(true)}>New</button>}
      </div>
    </>
  ) 
}

function Form({navigate, setNotes}) {
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
          <div className='w-8 h-8 md:w-10 md:h-10'>
            <img src={loadingGif} alt="loading.icon"></img>
          </div>
          :
          ""
          }
        </div>
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
