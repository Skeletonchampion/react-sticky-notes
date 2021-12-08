import '../App.css';
import React from "react";
import Masonry from 'react-masonry-css';

import Note from "./Note.js";
import New from './New';

const axios = require('axios');
axios.defaults.withCredentials = true;

const BACKEND_BASE_URL = "https://backend-reactnotes.herokuapp.com";

export default function Notes({notes, setNotes, navigate, username, setUsername}) {
    const [user, setUser] = React.useState(false);
    
    React.useEffect(() => {
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
      isAuth();
      getNotes();
    }, []);
  
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

    const breakpointColumnsObj = {
        default: 4,
        1100: 3,
        800: 2,
        600: 1
    };
  
    return (
      <>
        {user 
          ? 
          <div className='pb-[150px]'>
            {/* {notes.map(note => (
              <Note key={note.noteId} note={note} notes={notes} setNotes={setNotes} getNotes={getNotes}/>
            ))} */}
            <Masonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column">
                {notes.map(note => (
                    <Note key={note.noteId} note={note} notes={notes} setNotes={setNotes} getNotes={getNotes}/>
                ))}
                <New notes={notes} setNotes={setNotes} getNotes={getNotes} />
            </Masonry>
            <div className='w-full bg-white fixed bottom-0 left-0 right-0 z-50'>
              <div className='inline-block mr-4 text-lg font-bold text-red-400'>Username: {username}</div>
              <button className='outline-none p-2 bg-gray-400' onClick={handleLogout}>Logout</button>
            </div>
          </div>
          : 
          <div></div>}
      </>
    );
}