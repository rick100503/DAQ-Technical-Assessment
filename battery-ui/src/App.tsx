import React, { useState, useRef, useEffect } from 'react';
import LiveValue from './live_value'
import RedbackLogo from './redback_logo.jpg';
import './App.css';

function App() {

  const [temperature, setTemperature] = useState<number>(0);

  const ws: any = useRef(null);

  let app_header = document.getElementById('App-header') ;

  useEffect(() => {
    // using the native browser WebSocket object
    const socket: WebSocket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      console.log("opened");
    };

    socket.onclose = () => {
      console.log("closed");
    };



    socket.onmessage = (event) => {
      console.log("got message", event.data);
      let message_obj = JSON.parse(event.data);
      setTemperature(message_obj["battery_temperature"].toPrecision(3));

        if (message_obj["battery_temperature"].toPrecision(3) > 80 || message_obj["battery_temperature"].toPrecision(3) < 20){
            // document.body.style.backgroundColor =  "red";
            app_header!.style.backgroundColor = "red";
            
        }
        else{
          // document.body.style.backgroundColor =  "black";
          app_header!.style.backgroundColor = "black";
        }
    };

    ws.current = socket;

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">

        <nav>
        <img src={RedbackLogo} className="redback-logo" alt="Redback Racing Logo"/>
        </nav>

        <div className='content'>
          <div className='main_container'>
            <p className='value-title'>
            Live Battery Temperature
            </p>
            <LiveValue temp={temperature}/>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
