const synth = window.speechSynthesis;
const utterance = new SpeechSynthesisUtterance();
const DEFAULT_LANGUAGE = "en-US";

let voices = [];
let languages = [];
let langVoiceMap = {};
let currLang;
let currVoice;
let defaultLangIndex;

function init() {
  // Find English voices
  const allVoices = synth.getVoices();
  const enVoices = allVoices.filter((voice) => voice.lang.includes("en"));

  // Get the different accents
  const langMap = {};
  enVoices.map((voice) => (langMap[voice.lang] = voice.lang));
  languages = Object.keys(langMap);

  // Associate voices with the accent
  for (const language of languages) {
    langVoiceMap[language] = enVoices.filter(
      (voice) => voice.lang === language
    );
  }

  defaultLangIndex = languages.findIndex((lang) => lang === DEFAULT_LANGUAGE);
  currLang =
    defaultLangIndex === -1 ? languages[0] : languages[defaultLangIndex];
  voices = langVoiceMap[currLang];
  currVoice = voices[0];

  createLanguageElements();

  createVoiceElements();

  // Allow using enter key to play
  document.addEventListener("keyup", function (event) {
    if (event.key === "Enter") handlePlay();
  });
}
setTimeout(init, 200);

// Add languages radio buttons to the HTML
function createLanguageElements() {
  //   Language container
  const langDiv = document.getElementById("lang-select-container");
  if (!langDiv) return console.error("Language container not found");

  if (!languages?.length) return console.error("No languages available");

  const radioName = "lang-select-radio";

  // Create the language select elements
  for (const [index, lang] of languages.entries()) {
    const labelEl = document.createElement("label");

    const inputEl = document.createElement("input");
    inputEl.setAttribute("type", "radio");
    inputEl.setAttribute("name", radioName);

    // Check the default language if exists, otherwise the first
    if (
      (defaultLangIndex === -1 && index === 0) ||
      defaultLangIndex === index
    ) {
      inputEl.setAttribute("checked", "checked");
    }
    inputEl.setAttribute("value", lang);
    inputEl.setAttribute("onchange", "handleLangChange(value)");
    labelEl.appendChild(inputEl);

    const textEl = document.createElement("span");
    textEl.innerText = lang;
    labelEl.appendChild(textEl);

    langDiv.appendChild(labelEl);
  }
}

// Add voices radio buttons to the HTML
function createVoiceElements() {
  const voiceDiv = document.getElementById("voice-select-container");
  if (!voiceDiv) return console.error("Voice container not found");

  voiceDiv.innerHTML = "";

  const voices = langVoiceMap?.[currLang];
  if (!voices?.length) return console.error("No voices available", voices);

  const radioName = "voice-select-radio";

  for (const [index, voice] of voices.entries()) {
    const labelEl = document.createElement("label");

    const inputEl = document.createElement("input");
    inputEl.setAttribute("type", "radio");
    inputEl.setAttribute("name", radioName);
    if (index === 0) inputEl.setAttribute("checked", "checked");
    inputEl.setAttribute("value", voice.voiceURI);
    inputEl.setAttribute("onchange", "handleVoiceChange(value)");
    labelEl.appendChild(inputEl);

    const textEl = document.createElement("span");
    textEl.innerText = voice.name;
    labelEl.appendChild(textEl);

    voiceDiv.appendChild(labelEl);
  }
}

// User selected a language
function handleLangChange(value) {
  if (!languages.includes(value))
    return console.error("Invalid language selected");

  currLang = value;
  voices = langVoiceMap[currLang];
  currVoice = voices[0];
  createVoiceElements();
}

// User selected a voice
function handleVoiceChange(value) {
  const targetVoice = voices.find((voice) => voice.voiceURI === value);
  if (targetVoice) currVoice = targetVoice;
  else return console.error("Invalid voice selected");
}

// Plays the text the user has typed
function handlePlay() {
  const inputEl = document.getElementById("user-input-text");
  if (!inputEl) return console.error("Cannot find input element");

  const text = inputEl.value;
  if (!text) return;

  synth.cancel();
  utterance.voice = currVoice;
  utterance.text = text;
  synth.speak(utterance);
}
