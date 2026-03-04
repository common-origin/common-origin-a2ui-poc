export type SpeechRecognitionConstructor = new () => {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: unknown) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
};

export function getSpeechRecognitionConstructor(win: Window & typeof globalThis): SpeechRecognitionConstructor | null {
  const withSpeech = win as Window & typeof globalThis & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return withSpeech.SpeechRecognition || withSpeech.webkitSpeechRecognition || null;
}

export function mapSpeechError(error: string): string {
  if (error === 'not-allowed') return 'Microphone permission denied. Please allow microphone access and try again.';
  if (error === 'no-speech') return 'No speech detected. Please try again.';
  if (error === 'audio-capture') return 'No microphone was found. Please check your audio input device.';
  return 'Voice input failed. Please try again.';
}
