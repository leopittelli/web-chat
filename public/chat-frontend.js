const chat = (function () {
    let connection;
    let myName = false;
    const content = $('#content');
    const inner = $('#inner');
    const input = $('#input');
    const sendButton = $('#send');

    function scrollBottom() {
        inner[0].scrollTop = $(content).outerHeight(true);
    }

    function onRecieve(message) {
        content.append(buildHTML(message));

        scrollBottom();
    }

    function buildMessageHTML(message) {
        switch (message.type) {
            case 'text':
                return message.text;
            case 'image':
                return `<img src="${ message.url }" />`;
            default:
                return '';
        }
    }

    function buildHTML(message) {
        const authorClass = message.author === myName ? "me" : "them";
        const colorClass = message.color || 'admin';

        return `<div class="${'message-wrapper ' + authorClass + ' ' + colorClass }">
            <div class="circle-wrapper animated bounceIn">${ message.author.charAt(0) }</div>
            <div class="text-wrapper animated fadeIn">${ buildMessageHTML(message) }</div>
        </div>`;
    }

    function send(message) {
        if (validate(message)) {
            message.time = new Date().getTime();

            connection.send(JSON.stringify(message));
            if (!myName) {
                myName = message.text;
            }
        }
    }

    function receive(message) {
        if (validate(message)) {
            onRecieve(message);
        }
    }

    function validate(message) {
        switch (message.type) {
            case 'text':
                return message.text.length;
            case 'image':
                return message.url;
            default:
                return false;
        }
    }

    function sendMessage() {
        let text = input.val();
        send({type: "text", text: text});

        input.val('');
        input.focus();
    }

    function bindEvents() {
        input.focus();

        sendButton.on('click', function(e) {
            sendMessage();
        });

        input.on('keydown', function(e) {
            let key = e.which || e.keyCode;

            if (key === 13) { // enter key
                e.preventDefault();

                sendMessage();
            }
        });
    }

    function init() {
        window.WebSocket = window.WebSocket || window.MozWebSocket;

        if (!window.WebSocket) {
            onRecieve({type: "text", text: "Este navegador no soporta web sockets", author: "admin"});
            return;
        }

        connection = new WebSocket('ws://127.0.0.1:1337');

        connection.onopen = function () {
            onRecieve({type: "text", text: 'Escribe tu nombre:', author: "admin"});
        };

        connection.onerror = function (error) {
            onRecieve({type: "text", text: 'Error de conexión', author: "admin"});
        };

        connection.onmessage = function (message) {
            let json;
            try {
                json = JSON.parse(message.data);
            } catch (e) {
                console.log('This doesn\'t look like a valid JSON: ', message.data);
                return;
            }

            if (json.type === 'history') {
                for (let i=0; i < json.data.length; i++) {
                    receive(json.data[i]);
                }
            } else {
                receive(json.data);
            }
        };

        bindEvents();

        let conectionError = false;
        setInterval(function() {
            if (connection.readyState !== 1) {
                if (!conectionError) onRecieve({type: "text", text: 'Error de conexión', author: "admin"});
                conectionError = true;
            } else {
                conectionError = false;
            }
        }, 3000);
    }

    init();

    return {
        send,
        receive
    }
})();



function handleMessage(message) {
    const color = message.color;
    const author = message.author;
    const dt = new Date(message.time);

    if (message.type === 'text') {
        content.prepend('<p><span style="color:' + color + '">' + author + '</span> @ ' +
            + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
            + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
            + ': ' + message.text + ' <button onclick="synthesis.speak(\''+message.text+'\')">LEER</button></p>');
    } else if (message.type === 'image') {
        content.prepend('<p><span style="color:' + color + '">' + author + '</span> @ ' +
            + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
            + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
            + ': ' + '<img height="100" src="' + message.url + '" /></p>');
    } else if (message.type === 'audio') {
        content.prepend('<p><span style="color:' + color + '">' + author + '</span> @ ' +
            + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
            + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
            + ': ' + '<audio controls src="' + message.url + '" /></p>');
    } else if (message.type === 'speech') {
        content.prepend('<p><span style="color:' + color + '">' + author + '</span> @ ' +
            + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
            + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
            + ': SPEECH: ' + message.text + ' <button onclick="synthesis.speak(\''+message.text+'\')">LEER</button></p>');
    } else {
        console.log('Hmm..., I\'ve never seen message like this: ', message);
    }
}
