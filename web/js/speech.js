let synth = window.speechSynthesis;
let isSpeaking = false;
let forceStop = false;
// Speech to text.
let SpeechRecognition;
let SpeechGrammarList;
let SpeechRecognitionEvent;
let colors;
let grammar;
let recognition;
let speechRecognitionList;

/**
 * Start or stop the listening.
 *
 * @param value
 */
function speaking(value) {
    let speeching = document.getElementById("lblSpeechSleep");
    let listening = document.getElementById("lblSpeech");
    isSpeaking = value;
    if (value) {
        speeching.classList.add('invisible');
        listening.classList.remove('invisible');
        recognition.stop();
    } else {
        // setTimeout(function(){
            speeching.classList.remove('invisible');
            listening.classList.add('invisible');
            recognition.start();
        // }, 400);
    }
}

/**
 * Read a text.
 *
 * @param text
 * @param onEnd
 */
function speak(text, onEnd) {
    if (synth.speaking) {
        console.error('speechSynthesis.speaking');
        return;
    }
    if (text !== '') {
        speaking(true);
        let utterThis = new SpeechSynthesisUtterance(text);
        utterThis.onend = function (event) {
            try {
                speaking(false);
            } catch (e) {}
            if (onEnd) {
                onEnd();
            }
        }
        utterThis.onerror = function (event) {
            console.error('SpeechSynthesisUtterance.onerror: ', event);
            speaking(false);
        }
        utterThis.lang = 'es-ES';
        synth.speak(utterThis);
    }
}

/**
 * Get all results how array.
 *
 * @param results
 *
 * @returns {string}
 *
 * @constructor
 *
 * @see https://stackoverflow.com/a/68513091
 */
function ExtractTranscript(results) {
    let resp = [];
    for (let result in results[0]) {
        resp.push(results[0][result].transcript);
    }
    return resp;
}

/**
 * The command is in results?
 *
 * @param cmd The command
 * @param results Recognition results.
 *
 * @returns {boolean}
 */
function isCommand(cmd, results) {
    for (let result in results) {
        let opt = ''+results[result];
        if (cmd.toLowerCase() === opt.toLowerCase()) {
            return true;
        }
    }

    return false;
}

/**
 * Stop audio output and voice recognition.
 */
function stopSpeechRecognition() {
    forceStop = true;
    recognition.stop();
}

function initSpeechRecognition() {
    SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
    SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
    colors = ['a', 'e', 'i', 'o', 'u'];
    grammar = '#JSGF V1.0; grammar colors; public <color> = ' + colors.join(' | ') + ' ;'
    recognition = new SpeechRecognition();
    speechRecognitionList = new SpeechGrammarList();

    speechRecognitionList.addFromString(grammar, 1);
    recognition.grammars = speechRecognitionList;
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 20;
    recognition.onresult = function(event) {
        // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
        // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
        // It has a getter so it can be accessed like an array
        // The first [0] returns the SpeechRecognitionResult at the last position.
        // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
        // These also have getters so they can be accessed like arrays.
        // The second [0] returns the SpeechRecognitionAlternative at position 0.
        // We then return the transcript property of the SpeechRecognitionAlternative object
        var listened = event.results[0][0].transcript;
        // diagnostic.textContent = 'Result received: ' + color + '.';
        // bg.style.backgroundColor = color;
        // console.log('Confidence: ' + event.results[0][0].confidence);
        // console.log('Results: ' + ExtractTranscript(event.results) + '.');
        // if (isCommand('parar', event.results)) {
        //     speak('Parado');
        //     stopAll();
        //     return;
        // }
        Crafty.trigger('listener.result', {result: ExtractTranscript(event.results)});
        //console.log('Result received: ' + listened + '.');
        // speak(listened);
    }
    recognition.onerror = function(event) {
        if ('no-speech' !== event.error) {
            console.log('recognition.onerror: ', event);
        }
    }
    recognition.onend = function(event) {
        // console.log('recognition.onend: ', event);
        try {
            if (!forceStop) recognition.start();
        } catch (e) {
            //
        }
    }
    recognition.onstart = function(event) {
        // console.log('recognition.onstart: ', event);
    }
    recognition.onstatechange = function(event) {
        console.log('recognition.onstatechange: ', event);
        try {
            if (!forceStop) recognition.start();
        } catch (e) {
            //
        }
    }
}
