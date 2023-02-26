import { error } from 'console';
import { writeFile,appendFile } from 'fs';
import net from 'net';
import { parseArgs } from 'util';
import { WebSocket, WebSocketServer } from 'ws';

const TCP_PORT = parseInt(process.env.TCP_PORT || '12000', 10);

const tcpServer = net.createServer();
const websocketServer = new WebSocketServer({ port: 8080 });

let recent_timestamp = new Array()
let recent_outlier = 0;


writeFile("incidents.log",'',(err) => {
    if (err) throw err;
   })

var fs = require('fs')
var logger = fs.createWriteStream('incidents.log', {
        flags: 'a' // 'a' means appending (old data will be preserved)
            })

tcpServer.on('connection', (socket) => {
    console.log('TCP client connected');
    


    socket.on('data', (msg) => {
        let msg_string = msg.toString();

        try{
            JSON.parse(msg_string)
        }catch{
            console.error(error);
            msg_string = msg_string.slice(0,-1)
        }

        let currJSON = JSON.parse(msg_string);
        let battery_temp = parseFloat(currJSON.battery_temperature);
        let timestamp = currJSON.timestamp.toString();
        console.log("\n");
        
        if (recent_timestamp.length > 10){
            recent_timestamp = [];
        }

        recent_timestamp.push(currJSON);


        if (battery_temp > 80 || battery_temp < 20){
            console.log("OUTLIER");
            recent_outlier += 1
            if (recent_outlier == 3){

                console.log("RECORD");
                var os = require("os");
                logger.write(timestamp + os.EOL);
                recent_outlier = 0;
                // record timestamp in log
            }
        }

        console.log(msg_string);
        console.log(battery_temp);

        websocketServer.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(msg_string);
        }
      });

    });

    socket.on('end', () => {
        console.log('Closing connection with the TCP client');
    });
    
    socket.on('error', (err) => {
        console.log('TCP client error: ', err);
    });


});

websocketServer.on('listening', () => console.log('Websocket server started'));

websocketServer.on('connection', async (ws: WebSocket) => {
    console.log('Frontend websocket client connected to websocket server');
    ws.on('error', console.error);  
});

tcpServer.listen(TCP_PORT, () => {
    console.log(`TCP server listening on port ${TCP_PORT}`);
});


