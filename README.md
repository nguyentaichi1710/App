# App
- Chat: môi trường nodejs
Dùng express để khởi tạo sever.
rồi dùng socket io để lắng nghe sụ kiện từ sever.
cổng được chạy là: 3000.

const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);
const port = 3000;
server.listen(port, () => console.log('server running on port:' + port));

 để chạy sever ta dùng lệnh: 'nodemon sever.js' để file sever.js.
 
 -Call: Dùng PieSocket để tạo API Key của websocket 
        Tạo một biên để nắm giữ kết nối 
         const [conn, setConn] = useState(new WebSocket('wss://connect.websocket.in/v3/1998?api_key=Xn7ycNPVRfcjNSqA7mIaKT3p2tU5B8rWES7LWhNqcqdilIflUqYDqYyOEGiM',),);
         
          và dùng conn.onopen() để kết nối
        
 



