import '../App.css';
import React from "react";
import uniqid from "uniqid";
import DatePicker from 'react-datepicker';

const axios = require('axios');
axios.defaults.withCredentials = true;

const BACKEND_BASE_URL = "https://backend-reactnotes.herokuapp.com";

export default function New({notes, setNotes}) {
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
  
          setForm(false);
          setNotes(sortedNotes);
        }
        catch(err) {
          console.error(err);
      }
    }
  
    return (
      <>
        <div id="new" className='relative mr-2 mb-2 min-h-[150px] self-stretch border border-dashed border-gray-400 shadow-sm'>
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