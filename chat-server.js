// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat';

// Port where we'll run the websocket server
var webSocketsServerPort = 1337;


var path = require("path");
var webSocketServer = require('websocket').server;
var express = require('express');
var multer  = require('multer');
var imageUploads = multer({ dest: 'uploads/images/' });
var audioUploads = multer({ dest: 'uploads/audios/' });
var app = express();

/**
 * Global variables
 */
// latest 100 messages
var history = [];
// list of currently connected clients (users)
var clients = [];

/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Array with some colors
var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
// ... in random order
colors.sort(function(a,b) { return Math.random() > 0.5; } );

/**
 * HTTP server
 */
app.use('/public', express.static(path.join(__dirname, 'public')));
express.static.mime.define({'application/wasm': ['wasm']});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/frontend.html');
});

app.post('/images', imageUploads.single('image'), function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ url: req.protocol + '://' + req.get('host') + '/' + req.file.path }));
});

app.post('/audios', audioUploads.single('audio'), function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ url: req.protocol + '://' + req.get('host') + '/' + req.file.path }));
});

const server = app.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: server
});

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    // accept connection - you should check 'request.origin' to make sure that
    // client is connecting from your website
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
    var connection = request.accept(null, request.origin);
    // we need to know client index to remove them on 'close' event
    var index = clients.push(connection) - 1;
    var userName = false;
    var userColor = false;

    console.log((new Date()) + ' Connection accepted.');

    // send back chat history
    if (history.length > 0) {
        connection.sendUTF(JSON.stringify( { type: 'history', data: history} ));
    }

    // user sent some message
    connection.on('message', function(message) {
        if (message.type === 'utf8') { // accept only text
            const messageData = JSON.parse(message.utf8Data);

            if (userName === false) { // first message sent by user is their name
                // remember user name
                userName = htmlEntities(messageData.text);
                // get random color and send it back to the user
                userColor = colors.shift();
                connection.sendUTF(JSON.stringify({ type:'color', data: { color: userColor, text: userName, author: userName } }));
                console.log((new Date()) + ' User is known as: ' + userName
                            + ' with ' + userColor + ' color.');

            } else { // log and broadcast the message
                console.log((new Date()) + ' Received Message from '
                            + userName + ': ' + messageData);

                // we want to keep history of all sent messages
                var obj = {
                    time: (new Date()).getTime(),
                    author: userName,
                    color: userColor
                };

                if (messageData.type === "image") {
                    obj.url = messageData.url;
                    obj.type = 'image';
                } else if (messageData.type === "audio") {
                    obj.url = messageData.url;
                    obj.type = 'audio';
                } else if (messageData.type === "speech") {
                    obj.text = messageData.text;
                    obj.type = 'speech';
                } else {
                    obj.text = htmlEntities(messageData.text);
                    obj.type = 'text';
                }

                history.push(obj);
                history = history.slice(-100);

                // broadcast message to all connected clients
                var json = JSON.stringify({ type: 'message', data: obj });
                for (var i=0; i < clients.length; i++) {
                    clients[i].sendUTF(json);
                }
            }
        }
    });

    // user disconnected
    connection.on('close', function(connection) {
        if (userName !== false && userColor !== false) {
            console.log((new Date()) + " Peer "
                + connection.remoteAddress + " disconnected.");
            // remove user from the list of connected clients
            clients.splice(index, 1);
            // push back user's color to be reused by another user
            colors.push(userColor);
        }
    });

});