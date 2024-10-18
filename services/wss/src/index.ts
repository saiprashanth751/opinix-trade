import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3002 });

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);
  console.log("ws connected")

  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('ws connected');
});


export default wss;