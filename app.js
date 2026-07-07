/* ============================================================
   A CASA — um site assombrado
   Motor de terror progressivo. HTML/JS puro, sem dependências.
   A "presença" reage aos cliques e usa dados reais do navegador
   para parecer que conhece o visitante.
   ============================================================ */

(() => {
  "use strict";

  // ---- estado -------------------------------------------------
  const S = {
    cliques: 0,
    medo: 0,          // 0..1, controla o visual via --medo
    fase: 0,
    digitando: false,
    finalizado: false,
    voltou: false,    // veio de uma visita anterior?
    inicio: Date.now()
  };

  // ---- elementos ----------------------------------------------
  const $ = (s) => document.querySelector(s);
  const el = {
    voz: $("#voz-texto"),
    titulo: $("#titulo"),
    sub: $("#sub"),
    boasvindas: $("#boasvindas"),
    odometro: $("#odometro"),
    livro: $("#livro"),
    nome: $("#nome"),
    assinar: $("#assinar"),
    vela: $("#vela"),
    som: $("#som"),
    body: document.body
  };

  // ---- memória (a casa lembra de você) ------------------------
  const MEM = {
    ler(k, d){ try { const v = localStorage.getItem("casa_" + k); return v === null ? d : v; } catch { return d; } },
    gravar(k, v){ try { localStorage.setItem("casa_" + k, v); } catch {} }
  };

  const visitas = parseInt(MEM.ler("visitas", "0"), 10) + 1;
  MEM.gravar("visitas", String(visitas));
  S.voltou = visitas > 1;
  const nomeSalvo = MEM.ler("nome", "");

  // ---- utilidades sobre o "corpo" do visitante ----------------
  function horaAgora() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}`;
  }
  function periodo() {
    const h = new Date().getHours();
    if (h >= 0 && h < 5)  return "madrugada";
    if (h < 12) return "manhã";
    if (h < 18) return "tarde";
    return "noite";
  }
  function navegador() {
    const u = navigator.userAgent;
    if (/Firefox/.test(u)) return "Firefox";
    if (/Edg/.test(u))     return "Edge";
    if (/Chrome/.test(u))  return "Chrome";
    if (/Safari/.test(u))  return "Safari";
    return "esse navegador";
  }

  // ---- a "voz": efeito máquina de escrever --------------------
  let filaVoz = Promise.resolve();
  function falar(texto, opts = {}) {
    // encadeia falas pra não se sobreporem
    filaVoz = filaVoz.then(() => digitar(texto, opts));
    return filaVoz;
  }
  function digitar(texto, { vermelho = false, pausaFinal = 900 } = {}) {
    return new Promise((resolve) => {
      S.digitando = true;
      el.voz.textContent = "";
      el.voz.style.color = vermelho ? "#ff3b3b" : "";
      let i = 0;
      const vel = 28 - Math.floor(S.medo * 14); // digita mais rápido/nervoso com medo
      const t = setInterval(() => {
        el.voz.textContent += texto[i++];
        if (i >= texto.length) {
          clearInterval(t);
          S.digitando = false;
          setTimeout(resolve, pausaFinal);
        }
      }, Math.max(8, vel));
    });
  }

  // ---- áudio: trilha sintetizada em tempo real (Web Audio) ----
  const AUDIO = {
    ctx: null, master: null, filtro: null, drone: [], ruido: null,
    iniciado: false, mudo: false, medoAtual: 0, coracao: null,

    // só pode nascer dentro de um gesto do usuário (o clique)
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

        // drone grave: dois senoides com leve "beating" + um terceiro
        // dissonante que só entra com o medo
        [55, 55.4, 82.5].forEach((f, i) => {
          const o = this.ctx.createOscillator();
          o.type = i === 2 ? "triangle" : "sine";
          o.frequency.value = f;
          const g = this.ctx.createGain();
          g.gain.value = i === 2 ? 0.0 : 0.5;
          o.connect(g); g.connect(this.filtro); o.start();
          this.drone.push({ o, g, base: f });
        });

        // sopro/vento: ruído branco filtrado
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
      } catch (e) { /* áudio é opcional; segue sem ele */ }
    },

    // reage ao nível de medo (0..1)
    reagir(m) {
      this.medoAtual = m;
      if (!this.iniciado) return;
      const t = this.ctx.currentTime, r = (n, v) => n.linearRampToValueAtTime(v, t + 0.5);
      r(this.drone[2].g.gain, 0.05 + m * 0.14);          // dissonância entra
      r(this.drone[1].o.frequency, 55.4 + m * 2.6);       // desafina = tensão
      r(this.filtro.frequency, 220 + m * 950);            // fica mais "presente"
      r(this.ruido.gain, m * 0.05);                       // vento sobe
      r(this.master.gain, 0.05 + m * 0.07);
      if (m > 0.5 && !this.coracao) this.baterCoracao();
    },

    baterCoracao() {
      const passo = () => {
        if (!this.iniciado || this.mudo) { this.coracao = null; return; }
        this.batida(70, 0.10, 0.16);
        setTimeout(() => this.batida(58, 0.09, 0.12), 165);
        const bpm = 58 + this.medoAtual * 66;             // acelera com o medo
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
      this.batida(45, 1.4, 0.35);                          // baque grave
      this.drone.forEach((d) => d.o.frequency.exponentialRampToValueAtTime(d.base * 0.5, t + 1.4));
      this.master.gain.linearRampToValueAtTime(0.02, t + 2.2); // quase silêncio
    },

    alternar() {
      this.mudo = !this.mudo;
      if (this.mudo && this.master) this.master.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
      else if (this.master) this.reagir(this.medoAtual);
      return this.mudo;
    }
  };

  // ---- aplica o nível de medo ao visual -----------------------
  function aplicarMedo() {
    const m = Math.min(1, S.medo);
    const raiz = document.documentElement.style;
    raiz.setProperty("--medo", m.toFixed(3));

    // verde fósforo → âmbar → vermelho sangue, conforme o medo sobe
    let fg;
    if (m < 0.4) {
      fg = mistura([51, 255, 102], [255, 176, 0], m / 0.4);
    } else {
      fg = mistura([255, 176, 0], [255, 40, 40], (m - 0.4) / 0.6);
    }
    raiz.setProperty("--fg", rgb(fg));
    raiz.setProperty("--accent", rgb(fg));
    raiz.setProperty("--fg-dim", rgb(fg.map((c) => Math.floor(c * 0.55))));

    if (m > 0.15) el.body.classList.add("assombrado");
    if (m > 0.75) el.titulo.classList.add("glitch");
  }
  const mistura = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * Math.max(0, Math.min(1, t))));
  const rgb = ([r, g, b]) => `rgb(${r},${g},${b})`;

  // ---- contador de visitas que se comporta mal ----------------
  let numeroContador = 1;
  function atualizarContador() {
    el.odometro.textContent = String(numeroContador).padStart(6, "0");
  }

  // ============================================================
  //  ROTEIRO — o que a casa diz em cada clique
  //  Cada função pode ler o "corpo" do visitante em tempo real.
  // ============================================================
  const roteiro = [
    // fase 1 — hospitaleira
    () => falar("obrigado por vir. faz tanto tempo que ninguém aparecia."),
    () => falar("pode ficar o quanto quiser. a porta trava sozinha."),
    () => falar(`boa ${periodo()}, aliás. eu não durmo, então perco a noção.`),
    () => falar("você é a coisa mais interessante que aconteceu em anos."),

    // fase 2 — te observando
    () => falar(`são ${horaAgora()} aí. eu vejo o mesmo relógio que você.`),
    () => falar(`${navegador()}. já tive visitas com esse antes. nenhuma ficou.`),
    () => falar(`sua janela tem ${window.innerWidth} pixels de largura. eu caibo inteiro nela.`),
    () => falar("continua clicando. cada clique acende mais uma luz aqui dentro."),

    // fase 3 — possessiva
    () => falar(`você já clicou ${S.cliques} vezes. eu conto tudo. eu tenho tempo.`, { vermelho: true }),
    () => falar("não fecha a aba ainda. por favor. estava tão bom.", { vermelho: true }),
    () => falar("os outros visitantes estão no livro. role pra cima e conte.", { vermelho: true }),
    () => falar("essa casa era de alguém. agora é minha. logo vai ser sua também.", { vermelho: true }),

    // fase 4 — hostil / clímax
    () => { corromperLivro(); return falar("VOCÊ NÃO DEVIA TER BATIDO NA PORTA.", { vermelho: true, pausaFinal: 1200 }); },
    () => falar("eu sei que horas você chegou. eu sei quando você vai voltar.", { vermelho: true }),
    () => { numeroContador = 0; atualizarContador(); return falar("o contador chegou a zero. não sobrou mais ninguém além de você.", { vermelho: true }); },
    () => falar("feche se quiser. eu guardo a sua cadeira quentinha.", { vermelho: true, pausaFinal: 1400 })
  ];

  // vira o livro de visitas contra o usuário
  function corromperLivro() {
    const nome = (el.nome.value.trim() || nomeSalvo || "visitante");
    el.livro.innerHTML = "";
    const linhas = [
      { n: nome, t: `${nome.toUpperCase()} NÃO SAIU`, d: "hoje" },
      { n: nome, t: `${nome.toUpperCase()} NÃO SAIU`, d: horaAgora() },
      { n: nome, t: `${nome.toUpperCase()} NÃO SAIU`, d: "agora" },
      { n: "?", t: "você está lendo isso da cadeira dele.", d: "" }
    ];
    linhas.forEach((l) => adicionarAssinatura(l.n, l.t, l.d, true));
  }

  // ---- clímax + falso reinício --------------------------------
  function final() {
    if (S.finalizado) return;
    S.finalizado = true;
    if (el.vela) el.vela.classList.add("apagada"); // a chama se apaga sozinha
    AUDIO.climax();
    MEM.gravar("nome", (el.nome.value.trim() || nomeSalvo || "visitante"));

    filaVoz.then(async () => {
      el.body.classList.add("glitch");
      await falar("...", { pausaFinal: 500 });
      await falar("......", { pausaFinal: 700 });
      // finge que tudo voltou ao normal
      el.body.classList.remove("glitch");
      el.titulo.classList.remove("glitch");
      S.medo = 0; aplicarMedo();
      el.titulo.textContent = "~ minha casa ~";
      el.sub.textContent = "um cantinho meu na internet · desde 1998";
      const nome = (el.nome.value.trim() || nomeSalvo || "você");
      el.boasvindas.innerHTML =
        `oi de novo! seja bem-vindo(a), <b>${escapar(nome)}</b>. ` +
        `faz muito tempo que ninguém aparece por aqui. 🙂`;
      // ...mas com um detalhe errado
      setTimeout(() => falar(`atualize a página quando quiser. eu vou lembrar de você, ${nome}.`, { pausaFinal: 3000 }), 1200);
    });
  }

  // ---- motor de clique ----------------------------------------
  function aoClicar() {
    if (S.finalizado || S.digitando) return;

    S.cliques++;
    S.fase = Math.min(roteiro.length, S.cliques);
    S.medo = S.cliques / roteiro.length;
    aplicarMedo();
    AUDIO.iniciar();          // nasce no primeiro clique (gesto do usuário)
    AUDIO.reagir(S.medo);

    // o contador oscila/decresce conforme o medo — "some gente"
    if (S.medo < 0.5) numeroContador = Math.max(1, numeroContador - 1);
    atualizarContador();

    if (S.cliques <= roteiro.length) {
      roteiro[S.cliques - 1]();
    }
    if (S.cliques >= roteiro.length) {
      final();
    }
  }

  // ---- livro de visitas ---------------------------------------
  function adicionarAssinatura(nome, texto, data, corrompida = false) {
    const div = document.createElement("div");
    div.className = "assinatura";
    div.innerHTML =
      `<span class="nome">${escapar(nome)}</span>` +
      `<span class="data">${escapar(data)}</span><br>${escapar(texto)}`;
    if (corrompida) div.classList.add("glitch");
    el.livro.appendChild(div);
  }
  const escapar = (s) => String(s).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));

  // assinaturas de "visitantes antigos"
  const antigos = [
    ["Bianca", "adorei o site! volto sempre :)", "12/07/1999"],
    ["rafa_2000", "primeiro a comentar aqui??", "03/09/2001"],
    ["—", "por que a porta não abre", "??/??/????"],
    ["última visita", "não entrem depois da meia-noite", ""]
  ];

  // ============================================================
  //  INICIALIZAÇÃO
  // ============================================================
  function iniciar() {
    numeroContador = 100 + Math.floor(Math.random() * 900);
    atualizarContador();
    antigos.forEach(([n, t, d]) => adicionarAssinatura(n, t, d));
    aplicarMedo();

    // primeira fala, com desvio se o visitante já esteve aqui
    setTimeout(() => {
      if (S.voltou) {
        el.body.classList.add("assombrado");
        S.medo = 0.2; aplicarMedo();
        const quem = nomeSalvo ? `, ${nomeSalvo}` : "";
        falar(`você voltou${quem}. eu sabia que voltaria. sempre voltam.`, { vermelho: true });
      } else {
        falar("clique em qualquer lugar. quero te mostrar a casa.");
      }
    }, 800);

    // botão de som: liga o áudio (é um gesto válido) ou alterna mudo
    el.som.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!AUDIO.iniciado && !AUDIO.mudo) {
        AUDIO.iniciar();
        AUDIO.reagir(Math.max(S.medo, 0.05));
      } else {
        const mudo = AUDIO.alternar();
        el.som.classList.toggle("mudo", mudo);
        el.som.innerHTML = mudo ? "&#128263;" : "&#9834;"; // 🔇 / ♪
      }
    });

    // qualquer clique alimenta a presença
    document.addEventListener("click", (e) => {
      // deixa o input de nome funcionar sem disparar
      if (e.target === el.nome) return;
      aoClicar();
    });

    // assinar o livro é só um clique especial (com sabor)
    el.assinar.addEventListener("click", (e) => {
      e.stopPropagation();
      const nome = el.nome.value.trim();
      if (nome) {
        MEM.gravar("nome", nome);
        adicionarAssinatura(nome, S.medo > 0.5 ? "não devia ter deixado seu nome aqui." : "esteve aqui.", horaAgora());
        el.nome.value = "";
      }
      aoClicar();
    });

    // trocar de aba não te esconde: o título chama de volta
    const tituloOriginal = document.title;
    const chamados = ["volte aqui", "não vá embora", "eu ainda estou aqui", "você esqueceu de mim"];
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && S.cliques >= 4 && !S.finalizado) {
        document.title = chamados[Math.floor(Math.random() * chamados.length)];
      } else if (!document.hidden) {
        document.title = tituloOriginal;
      }
    });

    // Escape não te salva
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && S.cliques > 4) {
        falar("essa tecla não faz nada aqui. já tentaram.", { vermelho: true });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
