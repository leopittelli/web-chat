(function() {

    window.SpeechRecognition = window.SpeechRecognition ||
        window.webkitSpeechRecognition;
    var recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-AR';

    recognition.onresult = function (event) {
        var results = event.results;
        // results is an array of SpeechRecognitionResults
        // each of which is an array of SpeechRecognitionAlternatives
        // in this demo, we only use the first alternative
        var interimTranscript = '';
        for (var i = event.resultIndex; i !== results.length; ++i) {
            var result = results[i];
            // once speaking/recognition stops, a SpeechRecognitionEvent
            // is fired with a single result, for which isFinal is true
            if (result.isFinal) {
                console.log('Final transcript: ' + results[0][0].transcript);
                connection.send(JSON.stringify({ type: "speech", text: results[0][0].transcript}));
                recognition.stop();
                startButton.innerHTML = "speech";
            } else {
                interimTranscript += result[0].transcript;
                console.log('Interim transcript: ' + interimTranscript);
            }
        }
    };

    recognition.onend = function () {
        started = false;
        console.log('Recognition ended.');
    };

    recognition.onerror = function (event) {
        started = false;
        console.log('Error: ' + event.error);
    };

    var startButton = document.querySelector('.speech-recognition');
    let started = false;
    startButton.onclick = function () {
        if (started) recognition.stop();
        else recognition.start();
        started = !started;
        startButton.innerHTML = "grabando";
    };

})();