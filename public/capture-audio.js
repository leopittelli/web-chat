(function() {

    // set up basic variables for app

    var record = document.querySelector('.record');
    var stop = document.querySelector('.stop');
    var send = document.querySelector('.send');
    var canvas = document.querySelector('.visualizer');
    var mainSection = document.querySelector('.main-controls');

    // disable stop button while not recording

    stop.disabled = true;

    // visualiser setup - create web audio api context and canvas

    var audioCtx = new (window.AudioContext || webkitAudioContext)();
    var canvasCtx = canvas.getContext("2d");
    var blob;

    //main block for doing the audio recording

    if (navigator.mediaDevices.getUserMedia) {
        console.log('getUserMedia supported.');

        var constraints = { audio: true };
        var chunks = [];

        var onSuccess = function(stream) {
            var mediaRecorder = new MediaRecorder(stream);

            visualize(stream);

            record.onclick = function() {
                mediaRecorder.start();
                console.log(mediaRecorder.state);
                console.log("recorder started");
                record.style.background = "red";

                stop.disabled = false;
                record.disabled = true;
            }

            stop.onclick = function() {
                mediaRecorder.stop();
                console.log(mediaRecorder.state);
                console.log("recorder stopped");
                record.style.background = "";
                record.style.color = "";
                // mediaRecorder.requestData();

                stop.disabled = true;
                record.disabled = false;
            }

            send.onclick = function() {
                const form = new FormData();
                form.append('audio', blob, 'newAudio.png');

                fetch('/audios', {
                    method: 'POST',
                    body: form
                })
                    .then((response) =>  {
                        if (response.status >= 200 && response.status <= 302) {
                            return response
                        } else {
                            var error = new Error(response.statusText)
                            error.response = response
                            throw error
                        }
                    })
                    .then(response => response.json())
                    .then((data) => {
                        console.log('request succeeded with JSON response', data)
                        connection.send(JSON.stringify({ type: "audio", url: data.url}));
                    })
                    .catch((error) => {
                        console.log('ERROR', error)
                    })
            }

            mediaRecorder.onstop = function(e) {
                console.log("data available after MediaRecorder.stop() called.");
                blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
                chunks = [];
                console.log("recorder stopped");
            }

            mediaRecorder.ondataavailable = function(e) {
                chunks.push(e.data);
            }
        }

        var onError = function(err) {
            console.log('The following error occured: ' + err);
        }

        navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

    } else {
        console.log('getUserMedia not supported on your browser!');
    }

    function visualize(stream) {
        var source = audioCtx.createMediaStreamSource(stream);

        var analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        var bufferLength = analyser.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);

        source.connect(analyser);
        //analyser.connect(audioCtx.destination);

        draw()

        function draw() {
            WIDTH = canvas.width
            HEIGHT = canvas.height;

            requestAnimationFrame(draw);

            analyser.getByteTimeDomainData(dataArray);

            canvasCtx.fillStyle = 'rgb(200, 200, 200)';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

            canvasCtx.beginPath();

            var sliceWidth = WIDTH * 1.0 / bufferLength;
            var x = 0;


            for(var i = 0; i < bufferLength; i++) {

                var v = dataArray[i] / 128.0;
                var y = v * HEIGHT/2;

                if(i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width, canvas.height/2);
            canvasCtx.stroke();

        }
    }

    window.onresize = function() {
        canvas.width = mainSection.offsetWidth;
    }

    window.onresize();


})();