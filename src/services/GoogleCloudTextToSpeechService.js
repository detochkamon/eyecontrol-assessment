import axios from "axios";

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

const LIST_VOICES_URL = 'https://texttospeech.googleapis.com/v1/voices';
const TEXT_SYNTHESIZE_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';

const AudioEncoding = {
  LINEAR16: 'LINEAR16',
  MP3: 'MP3',
  OGG_OPUS: 'OGG_OPUS'
};

const authHeaders = {
  'X-Goog-Api-Key': GOOGLE_API_KEY
}

const defaultLanguageCode = 'en-US';

export default class GoogleCloudTextToSpeechService {
  static async getVoices(languageCode = defaultLanguageCode) {
    const config = {
      params: {
        languageCode
      },
      headers: authHeaders
    };
    return axios.get(LIST_VOICES_URL, config);
  }
  static async textSynthesize(text, voiceName, speakingRate, audioEncoding = AudioEncoding.OGG_OPUS) {
    const config = {
      headers: authHeaders
    };
    const data = {
      input: {
        text
      },
      voice: {
        languageCode: defaultLanguageCode,
        name: voiceName
      },
      audioConfig: {
        audioEncoding,
        speakingRate
      }
    }
    return axios.post(TEXT_SYNTHESIZE_URL, data, config);
  }
}