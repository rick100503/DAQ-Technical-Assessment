import React, { useState, useRef, useEffect } from 'react';
import LiveValue from './live_value'
import RedbackLogo from './redback_logo.jpg';
import './App.css';
import Recent_outliers from './recent_timestamps';


function App() {

  const [temperature, setTemperature] = useState<number>(0);
  const[outlier,setOutliers] = useState<Array<string>>();

  const ws: any = useRef(null);

 var outliers: string[] = [];

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
      

      if (20 < message_obj["battery_temperature"].toPrecision(3)){
          // too cold
          // shift all vars one down in array
          if (outliers.length == 10){
            for(let i = 1; i< 10; i++) {
              outliers[i-1] = outliers[i];
            }
            outliers[-1] = message_obj["timestamp"];
          }
          else{
            outliers.push(message_obj["timestamp"]);
          }
          //change colour
          
      } else if (message_obj["battery_temperature"].toPrecision(3) > 80){
          // too hot
          if (outliers.length == 10){
            for(let i = 1; i< 10; i++) {
              outliers[i-1] = outliers[i];
            }
            outliers[-1] = message_obj["timestamp"];
          }
          else{
            outliers.push(message_obj["timestamp"]);
          }
          //change to red colour
      } else{
        //good temperature - neurtal colour
      }

    };

    ws.current = socket;
    setOutliers(outliers);
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
          <div className='main_container' id='main'>
            <p className='value-title'>
            Live Battery Temperature
            </p>
            <LiveValue temp={temperature}/>
          </div>
          <div className='sub_container'>
          <p className='value-title'>
            Recent Incidents 
            </p>
          <ul id = "outliers list">
              <Recent_outliers timestamps = {outlier as Array<string>} />
          </ul>
          </div>
        </div>
      </header>
    </div>

  );
}

export default App;
