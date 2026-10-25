"""Synthesize the short sound effects used by Potion Shop (16-bit mono WAV)."""
import os
import wave

import numpy as np

OUT = os.path.join(os.path.dirname(__file__), "..", "game", "assets", "sfx")
SR = 22050


def env(n, attack=0.005, release=0.1):
    t = np.arange(n) / SR
    a = np.clip(t / attack, 0, 1)
    r = np.clip((n / SR - t) / release, 0, 1)
    return a * r


def tone(freq, dur, kind="sine", vol=0.5, slide=0.0):
    n = int(SR * dur)
    t = np.arange(n) / SR
    f = freq * (1 + slide * t / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    if kind == "sine":
        w = np.sin(ph)
    elif kind == "square":
        w = np.sign(np.sin(ph)) * 0.5
    elif kind == "tri":
        w = 2 / np.pi * np.arcsin(np.sin(ph))
    else:
        w = np.random.default_rng(1).uniform(-1, 1, n)
    return w * vol


def seq(*parts):
    return np.concatenate(parts)


def write(name, x):
    x = np.clip(x, -1, 1)
    os.makedirs(OUT, exist_ok=True)
    with wave.open(os.path.join(OUT, name), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes((x * 32000).astype(np.int16).tobytes())


def main():
    a = tone(988, 0.08, "square", 0.25) * env(int(SR * 0.08), release=0.03)
    b = tone(1319, 0.22, "square", 0.25) * env(int(SR * 0.22), release=0.18)
    write("sfx_coin.wav", seq(a, b))
    write("sfx_tap.wav", tone(660, 0.05, "tri", 0.4) * env(int(SR * 0.05), release=0.04))
    n = int(SR * 0.12)
    write("sfx_pop.wav", tone(500, 0.12, "sine", 0.6, slide=1.5) * env(n, release=0.1))
    n = int(SR * 0.35)
    noise = tone(0, 0.35, "noise", 0.35)
    k = np.ones(40) / 40
    splash = np.convolve(noise, k, mode="same") * 3 * env(n, release=0.3)
    write("sfx_splash.wav", splash + tone(220, 0.35, "sine", 0.2, slide=-0.5) * env(n, release=0.3))
    notes = [784, 988, 1175, 1568]
    write("sfx_ready.wav", seq(*[tone(f, 0.09, "tri", 0.35) * env(int(SR * 0.09), release=0.06) for f in notes]))
    n = int(SR * 0.4)
    write("sfx_angry.wav", tone(180, 0.4, "square", 0.3, slide=-0.4) * env(n, release=0.2))
    write("sfx_buy.wav", seq(tone(660, 0.06, "tri", 0.4) * env(int(SR * 0.06)), tone(880, 0.12, "tri", 0.4) * env(int(SR * 0.12))))
    n = int(SR * 0.6)
    boom = np.convolve(tone(0, 0.6, "noise", 0.8), np.ones(60) / 60, mode="same") * 6 * env(n, 0.002, 0.55)
    write("sfx_boom.wav", np.clip(boom + tone(90, 0.6, "sine", 0.6, slide=-0.6) * env(n, 0.002, 0.5), -1, 1))
    n = int(SR * 0.3)
    sweep = np.convolve(tone(0, 0.3, "noise", 0.5), np.ones(8) / 8, mode="same") * env(n, 0.05, 0.15)
    write("sfx_sweep.wav", sweep)
    write("sfx_pluck.wav", seq(tone(880, 0.05, "tri", 0.4) * env(int(SR * 0.05)), tone(1320, 0.1, "tri", 0.35) * env(int(SR * 0.1))))
    notes = [523, 659, 784, 1047, 784, 1047]
    write("sfx_levelup.wav", seq(*[tone(f, 0.11, "square", 0.22) * env(int(SR * 0.11), release=0.08) for f in notes]))


def music():
    """A gentle 16-bar loop (C - Am - F - G) with bass, arpeggios and a soft melody."""
    sr = 22050
    bpm = 96
    beat = 60 / bpm
    bars = 16
    total = int(sr * beat * 4 * bars)
    out = np.zeros(total)
    t_all = np.arange(total) / sr

    def note(freq, start, dur, vol, kind="sine", attack=0.01, release=0.25):
        i0 = int(start * sr)
        n = int(dur * sr)
        if i0 >= total:
            return
        n = min(n, total - i0)
        t = np.arange(n) / sr
        ph = 2 * np.pi * freq * t
        if kind == "tri":
            w = 2 / np.pi * np.arcsin(np.sin(ph))
        elif kind == "pluck":
            w = (np.sin(ph) + 0.4 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)) * np.exp(-t * 5)
        else:
            w = np.sin(ph) + 0.25 * np.sin(2 * ph)
        e = np.clip(t / attack, 0, 1) * np.clip((dur - t) / release, 0, 1)
        out[i0:i0 + n] += w * e * vol

    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    chords = [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]]  # C, Am, F, G
    melody = [76, 74, 72, 74, 76, 76, 76, None, 74, 74, 74, None, 76, 79, 79, None,
              76, 74, 72, 74, 76, 76, 76, 76, 74, 74, 76, 74, 72, None, None, None]
    for bar in range(bars):
        ch = chords[(bar // 2) % 4]
        t0 = bar * 4 * beat
        note(hz(ch[0] - 12), t0, beat * 2, 0.22, "sine", release=0.4)
        note(hz(ch[0] - 12), t0 + beat * 2, beat * 2, 0.18, "sine", release=0.4)
        for k in range(8):
            m = ch[k % 3] + (12 if k % 4 == 3 else 0) + 12
            note(hz(m), t0 + k * beat / 2, beat * 0.9, 0.09, "pluck")
        for k in range(2):
            m = melody[(bar % 8) * 4 + k * 2] if bar >= 4 else None
            if m:
                note(hz(m), t0 + k * 2 * beat, beat * 1.8, 0.07, "tri", attack=0.05, release=0.5)
    # Soft room echo
    d = int(sr * beat * 0.75)
    echo = np.zeros_like(out)
    echo[d:] = out[:-d] * 0.25
    out = out + echo
    out = out / max(1e-6, np.max(np.abs(out))) * 0.8
    # Seamless loop: fade the echo tail into the start
    tail = int(sr * 0.05)
    out[:tail] *= np.linspace(0, 1, tail)
    out[-tail:] *= np.linspace(1, 0, tail)
    write("music_shop.wav", out)


if __name__ == "__main__":
    music()
    main()
