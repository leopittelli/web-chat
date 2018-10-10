(function() {

    const button = document.getElementById('send-audio');
    const canvas = document.getElementById('audio-visualizer');

    const audioCtx = new (window.AudioContext || webkitAudioContext)();
    const canvasCtx = canvas.getContext("2d");
    let isRecording = false;
    let chunks = [];
    let animationId, mediaRecorder;

    if (navigator.mediaDevices.getUserMedia) {

        const onSuccess = function(stream) {
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.onstop = sendFile;
            mediaRecorder.ondataavailable = e => { chunks.push(e.data); };

            mediaRecorder.start();

            visualize(mediaRecorder.stream);

            canvas.classList.add("show");
            button.classList.add("animated");
        };

        const onError = function(err) {
            isRecording = false;
            chat.send({type: "text", text: "Ocurrió un error", author: "admin"});
        };

        button.onclick = function() {
            if (isRecording) {
                mediaRecorder.stop();
                mediaRecorder.stream.getTracks().forEach( track => track.stop() );
                cancelAnimationFrame(animationId);
                canvas.classList.remove("show");
                button.classList.remove("animated");
            } else {
                navigator.mediaDevices.getUserMedia({ audio: true }).then(onSuccess, onError);
            }

            isRecording = !isRecording;
        };
    } else {
        chat.send({type: "text", text: "Este navegador no soporta getUserMedia", author: "admin"});
    }

    function sendFile() {
        const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
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
                    const error = new Error(response.statusText);
                    error.response = response;
                    throw error
                }
            })
            .then(response => response.json())
            .then((data) => {
                chat.send({ type: "audio", url: data.url});
            })
            .catch((error) => {
                chat.send({type: "text", text: 'Error enviando el audio', author: "admin"});
            });

        chunks = [];
    }

    function visualize(stream) {
        const source = audioCtx.createMediaStreamSource(stream);

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        source.connect(analyser);

        draw();

        function draw() {
            const width = canvas.width;
            const height = canvas.height;

            animationId = requestAnimationFrame(draw);

            analyser.getByteTimeDomainData(dataArray);

            canvasCtx.fillStyle = 'rgb(200, 200, 200)';
            canvasCtx.fillRect(0, 0, width, height);

            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

            canvasCtx.beginPath();

            const sliceWidth = width * 1.0 / bufferLength;
            let x = 0;

            for(let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * height/2;

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

})();