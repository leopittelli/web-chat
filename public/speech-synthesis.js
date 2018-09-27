
var synthesis = (function() {

    var synth = window.speechSynthesis;
    var voiceSelect = document.querySelector('#voice-select');

    var voices = [];

    function populateVoiceList() {
        voices = synth.getVoices().filter(v => v.lang.startsWith('es'));

        for(i = 0; i < voices.length ; i++) {
            var option = document.createElement('option');
            option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

            if(voices[i].default) {
                option.textContent += ' -- DEFAULT';
            }

            option.value = i;

            voiceSelect.appendChild(option);
        }
    }

    function init() {
        populateVoiceList();

        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = populateVoiceList;
        }
    }

    function speak(text) {
        const utterThis = new SpeechSynthesisUtterance(text);
        utterThis.voice = voices[voiceSelect.value];
        synth.speak(utterThis);
    }

    init();

    return {
        speak
    }

})();