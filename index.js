const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io')

const app = express();
const server = createServer(app);
const io = new Server(server);
app.use(express.static(__dirname))

let users = 0;
let responses = 0;
let started = false;

const questions = require("./questions.json")
let prevQuestions = []

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/files/index.html")
})

app.get("/styles.css", (req, res) => {
    res.sendFile(__dirname + "/files/styles.css")
})

app.get("/main.js", (req, res) => {
    res.sendFile(__dirname + "/files/main.js")
})

io.on("connection", function(socket) {  
    io.emit("starter", ["participants", users])
    if(!started) {
        console.log("a user connected");
        users++;

        socket.emit("notif", "You are connected to the RIT SHED screen", 5000)
        io.emit("starter", ["participants", users])

        socket.emit("notif", "Try not to refresh the page or you will be disconnected", 5000);

        socket.on("disconnect", () => {
            console.log("user disconnected")
            users--;
            socket.emit("notif", "You are disconnected from the RIT SHED screen")
            io.emit("starter", ["participants", users])
        })

        socket.on("color", (color) => {
            console.log("Received color: " + color)
            responses++;
            if(responses == users) {
                responses = 0;
                io.emit("notif", "All responses received!")
            }
        })

        socket.on("submit", (response) => {
            console.log("Received response: " + response)
            responses++;
            socket.emit("notif", "Received your response. Thank you!")
            if(responses == users) {
                responses = 0;
                io.emit("notif", "All responses received!")
            }
        })
    } else {
        socket.emit("notif", "Survey has already started!")
    }
})

server.listen(3000, () => {
    console.log("listening on port 3000")
    io.emit("starter", ["clear"])

    // survey started after 5 seconds
    setInterval(() => {
        if(!started) {
            started = true;

            // send random question to all clients
            let question = questions[Math.floor(Math.random() * questions.length)]
            while(prevQuestions.includes(question)) {
                question = questions[Math.floor(Math.random() * questions.length)]
            }
            prevQuestions.push(question)

            io.emit("notif", "Survey started!", 5000);
            io.emit("starter", ["question", question]);

            // reset responses
        }
    }, 5000)

})