import React from 'react';
import './App.css';
import { useEffect, useState } from "react";

interface Outlierprops {
    timestamps: Array<string>
  }


function Recent_outliers({ timestamps } : Outlierprops){
    let valueColour = 'white';
    let html_string = "";
    console.log(timestamps.length);
    if (timestamps=== undefined || timestamps.length == 0){
        for (let i = 0; i < timestamps.length;i++ ){
            html_string += "<li>" + timestamps[i] + "</li>"
        }
        return <ul dangerouslySetInnerHTML={{ __html: html_string }} />
    }
    else{
        return <li> </li>
    }
}

export default Recent_outliers;