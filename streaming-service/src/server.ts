import { error } from 'console';
import { writeFile } from 'fs';
import net from 'net';
import { WebSocket, WebSocketServer } from 'ws';

const TCP_PORT = parseInt(process.env.TCP_PORT || '12000', 10);

const tcpServer = net.createServer();
const websocketServer = new WebSocketServer({ port: 8080 });

let outlier_arr = new Array()

function create_log(){
    writeFile("incidents.log",'',(err) => {
        if (err) throw err;
       })
}


function clear_outlier_arr(){
    outlier_arr = [];
}

tcpServer.on('connection', (socket) => {
    console.log('TCP client connected');
    
    create_log();
    setInterval(clear_outlier_arr,5000);

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

        console.log("\n");

        if (battery_temp > 80 || battery_temp < 20){
            outlier_arr.push(currJSON);
            console.log("OUTLIER");
            if (outlier_arr.length == 3){
                console.log("RECORD");
                writeFile()
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


