/**
 * Utility for Text-to-Speech playback using the Web Speech API
 */
const getVoiceForLanguage = (langCode) => {
    const voices = window.speechSynthesis.getVoices();
    // Try exact match
    let voice = voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase() || v.lang.toLowerCase().startsWith(langCode.toLowerCase()));
    // Fallbacks for specific languages
    if (!voice) {
        const fallbacks = {
            'vi': 'vi-VN',
            'en': 'en-US',
            'zh': 'zh-CN',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
            'fr': 'fr-FR',
            'th': 'th-TH'
        };
        const fallbackLang = fallbacks[langCode];
        if (fallbackLang) {
            voice = voices.find(v => v.lang === fallbackLang) || null;
        }
    }
    return voice;
};
export const playAudioTranscript = (text, lang = 'en') => {
    if (!window.speechSynthesis) {
        console.warn("Speech synthesis not supported in this browser.");
        return;
    }
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1.0;
    // Load voices if not already loaded (Chrome quirk)
    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
            const voice = getVoiceForLanguage(lang);
            if (voice)
                utterance.voice = voice;
            window.speechSynthesis.speak(utterance);
        };
    }
    else {
        const voice = getVoiceForLanguage(lang);
        if (voice)
            utterance.voice = voice;
        window.speechSynthesis.speak(utterance);
    }
};
export const stopAudioTranscript = () => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
};
