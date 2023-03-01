import React, { useState, useRef, useEffect } from 'react';
import LiveValue from './live_value'
import RedbackLogo from './redback_logo.jpg';
import './App.css';
import Recent_outliers from './recent_timestamps';


function App() {
  var outliers: string[] = [];
  let colour_str = "blue";
  const [temperature, setTemperature] = useState<number>(0);
  const[outlier,setOutliers] = useState<Array<string>>();

  const ws: any = useRef(null);



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
      

      if (20 > message_obj["battery_temperature"].toPrecision(3)){
          // too cold
          // shift all vars one down in array
          if (outliers.length >= 10){
            for(let i = 1; i< 10; i++) {
              outliers[i-1] = outliers[i];
            }
            outliers[9] = message_obj["timestamp"];
          }
          else{
            outliers.push(message_obj["timestamp"]);
          }
          //change colour
          colour_str = "linear-gradient(blue,rgb(17,5,128))";
          
      } else if (message_obj["battery_temperature"].toPrecision(3) > 80){
          // too hot
          if (outliers.length >= 10){
            for(let i = 1; i< 10; i++) {
              outliers[i-1] = outliers[i];
            }
            outliers[9] = message_obj["timestamp"];
          }
          else{
            outliers.push(message_obj["timestamp"]);
          }
          //change to red colour
          colour_str = "linear-gradient(red,rgb(128,5,25))";
      } else{
        //let angle = 180/60
        //let red = Math.round(256*Math.cos(temperature*angle));
        //let green = Math.round(256*Math.cos(temperature*angle + 120));
        //let blue = Math.round(256*Math.cos(temperature*angle - 120));

        //colour_str = "linear-gradient(rgb(" + red.toString() + "," + green.toString() + "," + blue.toString() +"),rgb(" + (red+50).toString() + "," + (green+50).toString() + "," + (blue + 50).toString() + "))"
        colour_str = "linear-gradient(green,rgb(65,92,65))";
      }
      document.getElementById('main')!.style.background = colour_str;
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
            Timestamps of extreme temperatures 
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
