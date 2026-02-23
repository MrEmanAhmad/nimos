// Use Web Audio API to generate a notification beep (no external file needed)
let audioCtx;
export function playNotificationSound() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 800;
    osc.type = 'sine';
    gain.gain.value = 0.3;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    osc.stop(audioCtx.currentTime + 0.5);
  } catch (e) { /* Audio not supported */ }
}
