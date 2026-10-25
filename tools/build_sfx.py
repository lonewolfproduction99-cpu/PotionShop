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
    notes = [523, 659, 784, 1047, 784, 1047]
    write("sfx_levelup.wav", seq(*[tone(f, 0.11, "square", 0.22) * env(int(SR * 0.11), release=0.08) for f in notes]))


if __name__ == "__main__":
    main()
