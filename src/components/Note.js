import '../App.css';
import React from "react";
import {DateTime} from "luxon";
import Countdown from 'react-countdown';

const axios = require('axios');
axios.defaults.withCredentials = true;

const BACKEND_BASE_URL = "https://backend-reactnotes.herokuapp.com";

export default function Note({note, notes, setNotes, getNotes}) {
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
      await getNotes();
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
            <div>
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