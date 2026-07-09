/* ============================================================
   Casa — o motor compartilhado por todos os cômodos.
   Fornece: a "voz" (máquina de escrever), o áudio sintetizado,
   o nível de medo (que tinge o CRT) e utilidades sobre o visitante.
   Cada página inclui este arquivo e chama window.Casa.
   ============================================================ */

window.Casa = (() => {
  "use strict";

  let nivelMedo = 0;
  let digitando = false;
  let filaVoz = Promise.resolve();

  const vozEl = () => document.querySelector("#voz-texto");

  // ---- utilidades sobre o "corpo" do visitante ----------------
  function hora() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}`;
  }
  function periodo() {
    const h = new Date().getHours();
    if (h >= 0 && h < 5) return "madrugada";
    if (h < 12) return "manhã";
    if (h < 18) return "tarde";
    return "noite";
  }
  function navegador() {
    const u = navigator.userAgent;
    if (/Firefox/.test(u)) return "Firefox";
    if (/Edg/.test(u)) return "Edge";
    if (/Chrome/.test(u)) return "Chrome";
    if (/Safari/.test(u)) return "Safari";
    return "esse navegador";
  }
  const escapar = (s) => String(s).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));

  // ---- áudio: trilha sintetizada em tempo real (Web Audio) ----
  const AUDIO = {
    ctx: null, master: null, filtro: null, drone: [], ruido: null,
    iniciado: false, mudo: false, medoAtual: 0, coracao: null,

    iniciar() {
      if (this.iniciado || this.mudo) return;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.0001;
        this.master.connect(this.ctx.destination);
        this.filtro = this.ctx.createBiquadFilter();
        this.filtro.type = "lowpass";
        this.filtro.frequency.value = 220;
        this.filtro.connect(this.master);
        [55, 55.4, 82.5].forEach((f, i) => {
          const o = this.ctx.createOscillator();
          o.type = i === 2 ? "triangle" : "sine";
          o.frequency.value = f;
          const g = this.ctx.createGain();
          g.gain.value = i === 2 ? 0.0 : 0.5;
          o.connect(g); g.connect(this.filtro); o.start();
          this.drone.push({ o, g, base: f });
        });
        const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate);
        const dados = buf.getChannelData(0);
        for (let i = 0; i < dados.length; i++) dados[i] = Math.random() * 2 - 1;
        const fonte = this.ctx.createBufferSource();
        fonte.buffer = buf; fonte.loop = true;
        const bp = this.ctx.createBiquadFilter();
        bp.type = "bandpass"; bp.frequency.value = 380; bp.Q.value = 0.7;
        this.ruido = this.ctx.createGain(); this.ruido.gain.value = 0.0;
        fonte.connect(bp); bp.connect(this.ruido); this.ruido.connect(this.master);
        fonte.start();
        this.iniciado = true;
        this.master.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 3);
      } catch (e) { /* áudio é opcional */ }
    },

    reagir(m) {
      this.medoAtual = m;
      if (!this.iniciado) return;
      const t = this.ctx.currentTime, r = (n, v) => n.linearRampToValueAtTime(v, t + 0.5);
      r(this.drone[2].g.gain, 0.05 + m * 0.14);
      r(this.drone[1].o.frequency, 55.4 + m * 2.6);
      r(this.filtro.frequency, 220 + m * 950);
      r(this.ruido.gain, m * 0.05);
      r(this.master.gain, 0.05 + m * 0.07);
      if (m > 0.5 && !this.coracao) this.baterCoracao();
    },

    baterCoracao() {
      const passo = () => {
        if (!this.iniciado || this.mudo) { this.coracao = null; return; }
        this.batida(70, 0.10, 0.16);
        setTimeout(() => this.batida(58, 0.09, 0.12), 165);
        const bpm = 58 + this.medoAtual * 66;
        this.coracao = setTimeout(passo, 60000 / bpm);
      };
      passo();
    },

    batida(freq, dur, vol) {
      if (!this.iniciado || this.mudo) return;
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(freq, t);
      o.frequency.exponentialRampToValueAtTime(freq * 0.5, t + dur);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(this.master); o.start(); o.stop(t + dur);
    },

    climax() {
      if (!this.iniciado) return;
      const t = this.ctx.currentTime;
      this.batida(45, 1.4, 0.35);
      this.drone.forEach((d) => d.o.frequency.exponentialRampToValueAtTime(d.base * 0.5, t + 1.4));
      this.master.gain.linearRampToValueAtTime(0.02, t + 2.2);
    },

    alternar() {
      this.mudo = !this.mudo;
      if (this.mudo && this.master) this.master.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
      else if (this.master) this.reagir(this.medoAtual);
      return this.mudo;
    }
  };

  // ---- a voz: efeito máquina de escrever ----------------------
  function falar(texto, opts = {}) {
    filaVoz = filaVoz.then(() => digitar(texto, opts));
    return filaVoz;
  }
  function digitar(texto, { vermelho = false, pausaFinal = 900 } = {}) {
    return new Promise((resolve) => {
      const alvo = vozEl();
      if (!alvo) { resolve(); return; }
      digitando = true;
      alvo.textContent = "";
      alvo.style.color = vermelho ? "#ff3b3b" : "";
      let i = 0;
      const vel = 28 - Math.floor(nivelMedo * 14);
      const t = setInterval(() => {
        alvo.textContent += texto[i++];
        if (i >= texto.length) {
          clearInterval(t);
          digitando = false;
          setTimeout(resolve, pausaFinal);
        }
      }, Math.max(8, vel));
    });
  }

  // ---- medo → visual (tinge o CRT) ----------------------------
  const mistura = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * Math.max(0, Math.min(1, t))));
  const rgb = ([r, g, b]) => `rgb(${r},${g},${b})`;
  function medo(m) {
    nivelMedo = Math.max(0, Math.min(1, m));
    const raiz = document.documentElement.style;
    raiz.setProperty("--medo", nivelMedo.toFixed(3));
    const fg = nivelMedo < 0.4
      ? mistura([51, 255, 102], [255, 176, 0], nivelMedo / 0.4)
      : mistura([255, 176, 0], [255, 40, 40], (nivelMedo - 0.4) / 0.6);
    raiz.setProperty("--fg", rgb(fg));
    raiz.setProperty("--accent", rgb(fg));
    raiz.setProperty("--fg-dim", rgb(fg.map((c) => Math.floor(c * 0.55))));
    if (nivelMedo > 0.15) document.body.classList.add("assombrado");
    AUDIO.reagir(nivelMedo);
  }

  // ---- helpers de página --------------------------------------
  function configurarSom(botao) {
    if (!botao) return;
    botao.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!AUDIO.iniciado && !AUDIO.mudo) {
        AUDIO.iniciar();
        AUDIO.reagir(Math.max(nivelMedo, 0.05));
      } else {
        const mudo = AUDIO.alternar();
        botao.classList.toggle("mudo", mudo);
        botao.innerHTML = mudo ? "&#128263;" : "&#9834;";
      }
    });
  }

  function configurarTituloAba(condicao) {
    const orig = document.title;
    const chamados = ["volte aqui", "não vá embora", "eu ainda estou aqui", "você esqueceu de mim"];
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && condicao()) {
        document.title = chamados[Math.floor(Math.random() * chamados.length)];
      } else if (!document.hidden) {
        document.title = orig;
      }
    });
  }

  return {
    falar, medo, audio: AUDIO,
    getMedo: () => nivelMedo,
    digitandoAgora: () => digitando,
    hora, periodo, navegador, escapar,
    configurarSom, configurarTituloAba
  };
})();
