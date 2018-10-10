(function() {

    window.SpeechRecognition = window.SpeechRecognition ||
        window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-AR';

    recognition.onresult = function (event) {
        const results = event.results;
        // results es un array de SpeechRecognitionResults
        // cada uno es un array de SpeechRecognitionAlternatives
        let interimTranscript = '';
        for (let i = event.resultIndex; i !== results.length; ++i) {
            let result = results[i];
            // cuando el reconocimiento termina, se dispara un evento SpeechRecognitionEvent
            // con un resultado para el cual isFinal es true
            if (result.isFinal) {
                chat.send({ type: "speech", text: results[0][0].transcript});
                recognition.stop();
                startButton.classList.remove("animated");
            } else {
                interimTranscript += result[0].transcript;
            }
        }
    };

    recognition.onend = function () {
        started = false;
    };

    recognition.onerror = function (event) {
        started = false;
        console.log('Error: ' + event.error);
    };

    const startButton = document.getElementById('speech');
    let started = false;
    startButton.onclick = function () {
        if (started) recognition.stop();
        else recognition.start();
        started = !started;
        startButton.classList.add("animated");
    };

})();