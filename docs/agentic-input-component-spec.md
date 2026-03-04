# Agentic Input Component Spec (Text + Voice)

## Purpose

Define a reusable design system component for agentic experiences where users can:

1. Type a message
2. Start/stop voice capture
3. See live feedback while speaking
4. Submit manually by text **or** auto-submit from final voice transcript

This component should feel familiar to users of ChatGPT, Claude, and Gemini style chat inputs, while staying deterministic, accessible, and design-system governed.

## Component Name

`AgentInput` 

## v1 Scope

- Platform: web desktop, optimized for Chrome/Edge
- Voice engine: Web Speech API (`SpeechRecognition` with `webkitSpeechRecognition` fallback)
- No external speech libraries
- Single-message input (not multiline editor in v1)
- Integrated controls for typing, mic capture, stop, and send using icon buttons
- Voice and send controls rendered inside the input container, aligned to the right

## Non-goals (v1)

- Native mobile app voice SDK integration
- Audio file upload/transcription
- Conversation history rendering (handled by parent)
- Model response streaming UI (handled by parent)

---

## User Experience Requirements

### Core Behaviors

1. User can type in text input and send via Enter or Send icon button.
2. User can start voice capture via mic icon button.
3. During capture, component shows:
   - clear "listening" state
  - animated circular gradient border treatment around the mic icon button (voice-active only)
   - interim transcript in input
   - waveform/level indicator activity
   - explicit stop control
4. On final transcript, component auto-submits (configured default for this project).
5. If transcript is empty or invalid, show inline recoverable guidance and do not submit.
6. Component gracefully handles unsupported browser, denied permissions, and no-speech timeout.

### UX Parity Expectations (Chat-style)

- Input remains the primary focus target.
- Mic and send controls are inside the input container and aligned right.
- Mic control remains discoverable when voice is supported.
- Send action is obvious and disabled only for explicit reasons.
- State transitions are immediate and visible (idle/listening/transcribing/submitting/error).
- Feedback language is short, human, and action-oriented.

---

## Interaction Model

### State Machine

States:

- `idle`
- `typing`
- `listening`
- `processingFinalTranscript`
- `submitting`
- `error`
- `disabled`

Events:

- `INPUT_CHANGE`
- `KEY_ENTER`
- `MIC_START`
- `MIC_STOP`
- `VOICE_INTERIM`
- `VOICE_FINAL`
- `VOICE_ERROR`
- `TIMEOUT_NO_SPEECH`
- `SUBMIT`
- `SUBMIT_SUCCESS`
- `SUBMIT_ERROR`
- `RESET_ERROR`

Transition rules:

- `idle|typing` + `MIC_START` -> `listening`
- `listening` + `VOICE_INTERIM` -> `listening` (updates interim text + meter)
- `listening` + `VOICE_FINAL` -> `processingFinalTranscript` -> `submitting`
- `listening` + `MIC_STOP` -> `idle|typing` (preserve typed value, clear interim)
- any + `VOICE_ERROR` -> `error`
- `submitting` + `SUBMIT_SUCCESS` -> `idle`
- `submitting` + `SUBMIT_ERROR` -> `error`
- `error` + `RESET_ERROR` -> `idle|typing`

---

## Component Anatomy

1. Text input field (single line)
2. Right-aligned trailing control cluster inside the input container
3. Mic icon button (toggle start/stop)
4. Explicit stop affordance while listening (same icon button state or dedicated stop icon)
5. Send icon button
6. Live status region (listening/transcribing/error/help)
7. Optional waveform/level meter region (visible while listening)

Layout guidance:

- Horizontal row on desktop
- Input has an internal trailing action area for controls
- Trailing action area uses icon buttons only (mic + send)
- Minimum touch target size for controls
- Preserve stable layout across state changes (no large shifts)

---

## Visual and Motion Requirements

- Listening state must be distinct from idle (icon + label + motion cue)
- Mic control supports active motion treatment while listening
- While listening, mic icon button shows a circular animated gradient border/ring that appears to travel around the button perimeter
- Gradient ring must be token-driven and use the design-system blue family (no hard-coded hex values)
- Ring animation should be smooth and continuous while listening, and removed immediately on stop/error/submit transitions
- Send control remains visible in all non-disabled states
- Waveform/level meter updates in near-real-time
- Motion respects reduced-motion preference
- Error and warning states use design-system semantic feedback patterns

### Voice-Active Ring Specification

- Shape: circular ring around the mic icon button with a small gap between icon fill and ring
- Trigger: visible only in `listening` state
- Animation: rotating or traveling gradient effect around full circumference
- Color source: DS blue token(s) only, with optional alpha variants from token system
- Contrast: idle and listening states remain distinguishable even without animation
- Reduced motion: replace animated ring with static blue ring + listening label/state text
- The treatment must not shift layout, resize the control cluster, or affect send button placement

---

## Accessibility Requirements

### Keyboard

- Tab order: input -> mic icon button -> send icon button
- Enter sends when valid and not disabled
- Escape stops active listening

### Screen Reader

- Input has accessible label
- Mic icon button exposes pressed/listening semantics (`aria-pressed` when toggle)
- Icon-only controls must always include accessible names (`aria-label`)
- Live region announces key state changes:
  - listening started
  - interim transcript available
  - final transcript captured
  - submission in progress
  - errors (permission denied, no speech, unsupported)

### Assistive Preferences

- Reduced motion disables pulse/wave animation while retaining textual status
- Color alone is never the only communication mechanism

---

## Voice Behavior Contract

### Detection

- Feature-detect `SpeechRecognition` then `webkitSpeechRecognition`
- If unavailable, hide or disable mic control based on product preference

### Recognition Configuration (default)

- `lang`: `en-AU`
- `interimResults`: `true`
- `continuous`: `false`

### Timeouts and Stop Conditions

- No-speech timeout: 8 seconds after listening start (configurable)
- Manual stop always available while listening
- On stop: clear interim transcript, retain last committed text

### Auto-submit Behavior

- When final transcript is non-empty, normalize and auto-submit
- If parent returns submit error, repopulate input with final transcript for quick retry

### Error Mapping (minimum)

- `not-allowed`: microphone permission denied
- `no-speech`: no speech detected
- `audio-capture`: no microphone device
- fallback: generic voice input failure

---

## Public API (Proposed)

```ts
type AgentInputSubmitSource = 'text' | 'voice-final';

type AgentInputVoiceErrorCode =
  | 'not-supported'
  | 'not-allowed'
  | 'no-speech'
  | 'audio-capture'
  | 'aborted'
  | 'unknown';

interface AgentInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;

  onSubmit: (payload: {
    text: string;
    source: AgentInputSubmitSource;
    timestamp: string;
  }) => void | Promise<void>;

  placeholder?: string;
  disabled?: boolean;
  isSubmitting?: boolean;

  controlPlacement?: 'inside-right'; // default 'inside-right' in v1
  micAriaLabel?: string; // default 'Start voice input' / 'Stop voice input' by state
  sendAriaLabel?: string; // default 'Send message'

  enableVoice?: boolean;
  autoSubmitOnVoiceFinal?: boolean; // default true
  voiceLanguage?: string; // default 'en-AU'
  noSpeechTimeoutMs?: number; // default 8000

  onVoiceStart?: () => void;
  onVoiceStop?: () => void;
  onVoiceInterim?: (text: string) => void;
  onVoiceFinal?: (text: string) => void;
  onVoiceError?: (error: {
    code: AgentInputVoiceErrorCode;
    message: string;
  }) => void;

  // Optional externally rendered help/error text hooks
  statusMessage?: string;
  errorMessage?: string;
}
```

Notes:

- Component should support controlled and uncontrolled text value.
- Parent owns network lifecycle; component owns local mic lifecycle.
- v1 uses icon-button controls only for mic/send actions.

---

## Examples (Normative)

### Idle (typed input)

- Input shows placeholder text
- Right side contains two icon buttons: mic then send
- Send icon button disabled when input is empty

### Listening

- Mic icon button shows active/listening visual state
- Send icon button remains visible and follows disabled/enabled rules
- Interim transcript appears in input value region
- Optional waveform/level meter appears

### Submitting

- Input and icon buttons reflect submitting/disabled state
- Status message announces submission progress

### Error

- Input remains usable for retry
- Relevant error message shown in status region
- Icon controls remain visible unless globally disabled

---

## Copy Guidance (Default Messages)

- Idle helper: "Ask about transactions, spending, or transfers"
- Listening: "Listening… speak now"
- Processing final transcript: "Finishing voice input…"
- Permission denied: "Microphone permission denied. Allow access and try again."
- No speech: "No speech detected. Try again."
- Unsupported: "Voice input is not supported in this browser. Use Chrome or Edge."

---

## Acceptance Criteria

1. Typing and pressing Enter triggers `onSubmit` with source `text`.
2. Send icon button triggers `onSubmit` with source `text`.
3. Mic start enters listening state and announces status.
4. Interim transcript appears live while listening.
5. Final transcript auto-submits with source `voice-final`.
6. Manual stop exits listening cleanly without crashing or stale UI.
7. No-speech timeout emits user-visible guidance and returns to idle.
8. Permission denial shows clear actionable message.
9. Unsupported browsers do not break typing/send path.
10. Reduced motion preference disables non-essential animation.
11. Component is keyboard-operable and screen-reader understandable.
12. In listening state, mic icon button renders a token-driven circular blue gradient ring animation (or static ring under reduced motion) with no layout shift.

---

## Test Matrix (Minimum)

### Unit

- Speech API constructor detection priority (`SpeechRecognition` then `webkitSpeechRecognition`)
- Error-code-to-message mapping
- State transitions for start/stop/interim/final/error

### Component (RTL/JSDOM with mocks)

- Type -> Enter submit
- Type -> click Send icon button submit
- Start mic -> interim transcript shown
- Final transcript -> auto-submit path
- Manual stop -> state reset
- Unsupported browser -> mic hidden/disabled + text path still works
- Permission denied/no-speech -> error message + recovery

### Accessibility

- Keyboard tab and Enter/Escape behavior
- `aria-pressed`, labels, and live-region announcements present
- No critical a11y violations in default state and listening state

---

## Implementation Notes for Common Origin DS Team

1. Build `AgentInput` as a compositional DS primitive that wraps existing DS text and icon-button primitives.
2. Keep the speech API adapter isolated so consumers can swap implementation later.
3. Expose controlled state hooks/events rather than coupling to app-specific agent clients.
4. Ensure visual states are token-driven and theme-compatible.
5. Preserve deterministic behavior under rapid interactions (double-tap mic, quick stop/start, submit while finalizing transcript).

## Integration Checklist for This A2UI Demo

1. Replace current query controls in `app/page.tsx` with `AgentInput`.
2. Keep existing submit contract: user text flows into current `handleSubmit` logic.
3. Keep current voice defaults unless overridden: `en-AU`, interim enabled, no-speech timeout 8s.
4. Add query-routing regression tests ensuring voice phrasing still maps correctly through `analyzeQuery()` in `src/server/queryRouter.ts`.
5. Expand routing regex coverage if spoken phrasing diverges from typed phrasing (for example: "send one hundred dollars to savings" vs "$100 transfer to savings").

---

## Agent Build Prompt (Ready to Paste)

Build a `AgentInput` component for the Common Origin design system with integrated text and voice input.

Requirements:

- Web desktop first (Chrome/Edge) with Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition` fallback)
- User can type and submit with Enter or Send icon button
- User can toggle microphone start/stop via mic icon button
- Mic and send controls are icon-only and rendered inside the input container, aligned right
- While listening, show clear listening state, interim transcript in input, and live waveform/level feedback
- While listening, apply an animated circular gradient border around the mic icon button using DS blue token(s); respect reduced-motion with a static equivalent
- Provide explicit stop affordance while listening
- On non-empty final transcript, auto-submit by default (`source: 'voice-final'`)
- Handle unsupported browser, permission denied, no speech timeout (8s default), audio capture errors
- Keep typing/send functional even when voice is unavailable or fails
- Accessibility: keyboard support, live-region announcements, proper labels/pressed states, reduced-motion compliance
- Expose prop/event API as described in this spec and keep component framework-agnostic within DS conventions
- Include unit tests + component tests + a11y-focused assertions for all primary states and voice error paths

Deliverables:

1. Component implementation
2. Stories/examples for idle/listening/error/submitting states
3. API docs
4. Test suite with mocked speech recognition lifecycle
