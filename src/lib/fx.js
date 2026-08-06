const SOUND_KEY = "trailventure_sound";

export function soundEnabled() {
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundEnabled(on) {
  try {
    localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {
    // storage unavailable
  }
}

// A tiny, dependency-free "beep" so the sound toggle does something real.
export function beep({ freq = 520, duration = 0.15 } = {}) {
  try {
    if (!soundEnabled()) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.02);
    setTimeout(() => ctx.close(), duration + 50);
  } catch {
    // audio unavailable
  }
}

// Spawns a burst of falling colored pieces from the top of the viewport.
export function confetti(count = 80) {
  const colors = ["#2563eb", "#10b981", "#a855f7", "#f59e0b", "#ec4899"];
  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement("div");
    const size = 6 + Math.random() * 8;
    const left = Math.random() * 100;
    const delay = Math.random() * 0.3;
    const duration = 1.5 + Math.random() * 1.5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const rotate = Math.random() * 360;

    piece.style.position = "fixed";
    piece.style.top = "-20px";
    piece.style.left = `${left}vw`;
    piece.style.width = `${size}px`;
    piece.style.height = `${size * 0.45}px`;
    piece.style.background = color;
    piece.style.borderRadius = "2px";
    piece.style.zIndex = "9999";
    piece.style.pointerEvents = "none";
    piece.style.willChange = "transform";
    piece.style.animation = `confetti-fall ${duration}s ease-in ${delay}s forwards`;

    const cleanup = () => {
      piece.remove();
      piece.removeEventListener("animationend", cleanup);
    };
    piece.style.transform = `rotate(${rotate}deg)`;
    piece.addEventListener("animationend", cleanup);
    setTimeout(() => document.body.appendChild(piece), delay * 1000);
  }
}