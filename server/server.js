const http = require('http');
const {Server} = require('socket.io');

const server = http.createServer();
const PORT = process.env.PORT || 4000;


const io = new Server(server,{
    cors: {origin:"*"}
});

let waitingPlayer = null;

io.on("connection",(socket)=>{
    
    socket.on("search_game", () => {
        if (waitingPlayer && waitingPlayer.id !== socket.id) {
            // Match found
            const room = `room_${waitingPlayer.id}_${socket.id}`;
            
            waitingPlayer.join(room);
            socket.join(room);
            
            waitingPlayer.roomId = room;
            socket.roomId = room;
            
            waitingPlayer.emit("game_start", { role: "X" });
            socket.emit("game_start", { role: "O" });
            
            waitingPlayer = null;
        } else {
            // Wait for opponent
            waitingPlayer = socket;
            socket.emit("waiting");
        }
    });

    socket.on("clicked",(sqr,turn)=>{
        if (socket.roomId) {
            socket.to(socket.roomId).emit("console", sqr, turn);
        }
    })

    socket.on("reset", () => {
        if (socket.roomId) {
            io.to(socket.roomId).emit("reset");
        }
    });

    socket.on("disconnect", () => {
        if (waitingPlayer === socket) {
            waitingPlayer = null;
        }
        if (socket.roomId) {
            socket.to(socket.roomId).emit("opponent_left");
        }
    });

    socket.on("chat_message", (message) => {
        if (socket.roomId) {
            socket.to(socket.roomId).emit("new_message", message);
        }
    });
})

server.listen(PORT,()=>{
    console.log("Server is Running on port "+PORT)
})