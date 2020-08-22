import React, { Component, useEffect, useContext } from 'react';
import Video from './components/video';
import NavBar from './components/navbar';
import SidePanel from './components/sidepanel';
import './App.css';

const App = () =>{
  return (
    <div style={{ overflow: 'hidden' }}>
      <NavBar />
      <div style={{ display: 'flex', height: '93.5vh', overflow: 'hidden', maxWidth: '100%' }}>
        <Video />
        <SidePanel />
      </div>
    </div>
  )
}

export default App;