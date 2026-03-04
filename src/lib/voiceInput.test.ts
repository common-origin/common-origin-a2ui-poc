import { describe, expect, it } from 'vitest';
import { getSpeechRecognitionConstructor, mapSpeechError } from './voiceInput';

describe('voiceInput helpers', () => {
  it('prefers SpeechRecognition when present', () => {
    const Ctor = function MockSpeechRecognition() {} as unknown as new () => unknown;
    const win = {
      SpeechRecognition: Ctor,
      webkitSpeechRecognition: undefined,
    } as unknown as Window & typeof globalThis;

    expect(getSpeechRecognitionConstructor(win)).toBe(Ctor);
  });

  it('falls back to webkitSpeechRecognition', () => {
    const Ctor = function MockWebkitSpeechRecognition() {} as unknown as new () => unknown;
    const win = {
      SpeechRecognition: undefined,
      webkitSpeechRecognition: Ctor,
    } as unknown as Window & typeof globalThis;

    expect(getSpeechRecognitionConstructor(win)).toBe(Ctor);
  });

  it('returns null when no speech recognition API exists', () => {
    const win = {
      SpeechRecognition: undefined,
      webkitSpeechRecognition: undefined,
    } as unknown as Window & typeof globalThis;

    expect(getSpeechRecognitionConstructor(win)).toBeNull();
  });

  it('maps speech recognition errors to user-friendly messages', () => {
    expect(mapSpeechError('not-allowed')).toContain('permission denied');
    expect(mapSpeechError('no-speech')).toContain('No speech detected');
    expect(mapSpeechError('audio-capture')).toContain('No microphone');
    expect(mapSpeechError('network')).toContain('Voice input failed');
  });
});
