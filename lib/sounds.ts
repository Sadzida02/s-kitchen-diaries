// Small cute sounds for the site, made with the browser's own sound tools (no sound files needed).
// They only play after the visitor has clicked or tapped something, and the speaker button in the
// footer turns them off (the choice is remembered in this browser). Browser code only.

const KEY = "sounds";
let context: AudioContext | null = null;

export function soundsOn(): boolean {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSounds(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // a browser that does not allow storing: the choice just lasts until the page is closed
  }
  window.dispatchEvent(new Event("sounds-change"));
}

// the sound machine, or nothing when sounds are off or the browser has none
function machine(): AudioContext | null {
  if (typeof window === "undefined" || !soundsOn()) return null;
  const Ctor =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  context ??= new Ctor();
  if (context.state === "suspended") void context.resume();
  return context;
}

// a burst of noise, like sprinkling or sizzling
function noise(c: AudioContext, seconds: number): AudioBufferSourceNode {
  const buffer = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * seconds)), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = c.createBufferSource();
  source.buffer = buffer;
  return source;
}

// a soft round "ping" that fades out
function tone(c: AudioContext, at: number, from: number, to: number, length: number, volume: number, type: OscillatorType = "sine") {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, at);
  osc.frequency.exponentialRampToValueAtTime(to, at + length);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  osc.connect(gain).connect(c.destination);
  osc.start(at);
  osc.stop(at + length + 0.05);
}

// a short band of noise (one grain of sprinkling, one crackle)
function grain(c: AudioContext, at: number, length: number, freq: number, volume: number) {
  const source = noise(c, length + 0.05);
  const filter = c.createBiquadFilter();
  const gain = c.createGain();
  filter.type = "bandpass";
  filter.frequency.value = freq;
  filter.Q.value = 1.1;
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + length * 0.2);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  source.connect(filter).connect(gain).connect(c.destination);
  source.start(at);
  source.stop(at + length + 0.05);
}

// a little pop for ordinary buttons and links
export function playPop() {
  const c = machine();
  if (!c) return;
  const t = c.currentTime;
  tone(c, t, 520, 900, 0.09, 0.16);
  tone(c, t + 0.05, 780, 1300, 0.08, 0.08);
}

// the glass jar being tipped: a clink, then spice sprinkling out
export function playShake() {
  const c = machine();
  if (!c) return;
  const t = c.currentTime;
  tone(c, t, 1760, 1700, 0.18, 0.1, "triangle");
  tone(c, t + 0.02, 2640, 2500, 0.14, 0.05, "triangle");
  for (let i = 0; i < 7; i++) grain(c, t + 0.12 + i * 0.075, 0.07, 2200 + Math.random() * 1800, 0.18);
}

// the jar going back: one soft clink
export function playClink() {
  const c = machine();
  if (!c) return;
  const t = c.currentTime;
  tone(c, t, 1500, 1450, 0.16, 0.09, "triangle");
  tone(c, t + 0.015, 2250, 2200, 0.1, 0.04, "triangle");
}

// something cooking: a sizzle with crackles and a couple of whisk pings
export function playCook() {
  const c = machine();
  if (!c) return;
  const t = c.currentTime;
  const hiss = noise(c, 1.3);
  const filter = c.createBiquadFilter();
  const gain = c.createGain();
  filter.type = "highpass";
  filter.frequency.value = 3800;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.1, t + 0.12);
  gain.gain.setValueAtTime(0.1, t + 0.6);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.25);
  hiss.connect(filter).connect(gain).connect(c.destination);
  hiss.start(t);
  hiss.stop(t + 1.3);
  for (let i = 0; i < 14; i++) grain(c, t + Math.random() * 1.0, 0.02 + Math.random() * 0.02, 2500 + Math.random() * 3500, 0.22);
  tone(c, t + 0.05, 1500, 1450, 0.12, 0.08, "triangle");
  tone(c, t + 0.22, 1900, 1850, 0.12, 0.07, "triangle");
  tone(c, t + 0.4, 2300, 2200, 0.14, 0.06, "triangle");
}
