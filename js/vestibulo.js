/* ============================================================
   Vestíbulo — o hub da casa.
   Escalada de terror a cada clique, livro de visitas, oráculo,
   mapa da casa e contador de selos. Usa Casa (motor) e Estado (save).
   ============================================================ */

(() => {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const el = {
    titulo: $("#titulo"), sub: $("#sub"), boasvindas: $("#boasvindas"),
    odometro: $("#odometro"), livro: $("#livro"), nome: $("#nome"), assinar: $("#assinar"),
    vela: $("#vela"), som: $("#som"),
    oraculo: $("#oraculo"), dialogo: $("#dialogo"), pergunta: $("#pergunta"),
    perguntar: $("#perguntar"), restantes: $("#restantes"),
    planta: $("#planta"), selos: $("#selos"),
    body: document.body
  };

  const S = { cliques: 0, medo: 0, finalizado: false, voltou: false };

  const visitas = Estado.registrarVisita();
  S.voltou = visitas > 1;

  // atalhos ao motor
  const falar = Casa.falar;
  const hora = Casa.hora, periodo = Casa.periodo, navegador = Casa.navegador, escapar = Casa.escapar;

  function aplicarMedo() {
    Casa.medo(S.medo);
    if (S.medo > 0.75) el.titulo.classList.add("glitch");
  }

  // ---- contador de visitas que se comporta mal ----------------
  let numeroContador = 1;
  const atualizarContador = () => { el.odometro.textContent = String(numeroContador).padStart(6, "0"); };

  // ============================================================
  //  MAPA DA CASA
  // ============================================================
  const COMODOS = [
    { id: "saguao", nome: "saguão", estado: () => "aceso" },
    { id: "sala", nome: "sala de estar", url: "comodos/sala.html", dica: "após o oráculo",
      estado: () => Estado.flag("oraculo_completo") ? "aceso" : "trancado" },
    { id: "quarto", nome: "quarto", url: "comodos/quarto.html", dica: "assine o livro",
      estado: () => Estado.flag("livro_assinado") ? "aceso" : "trancado" },
    { id: "cozinha", nome: "cozinha", url: "comodos/cozinha.html", dica: "clique na vela",
      estado: () => Estado.flag("vela_pista") ? "aceso" : "trancado" },
    { id: "corredor", nome: "corredor escuro", dica: "visite sala e quarto", estado: () => "breve" },
    { id: "porao", nome: "porão", dica: "reúna os quatro selos", estado: () => "breve" },
    { id: "varanda", nome: "varanda", url: "comodos/varanda.html", estado: () => "aceso" }
  ];

  function renderizarMapa() {
    el.planta.innerHTML = "";
    COMODOS.forEach((c) => {
      const st = c.estado();
      const linkavel = st === "aceso" && c.url;
      const node = document.createElement(linkavel ? "a" : "div");
      node.className = "porta " + st;
      node.dataset.id = c.id;
      if (linkavel) node.href = c.url;
      const trancada = st === "trancado" || st === "breve";
      let html = (trancada ? '<span class="cadeado"></span>' : "") + c.nome;
      if (st === "trancado") html += `<span class="cond">${c.dica}</span>`;
      else if (st === "breve") html += `<span class="cond">${c.dica} · em breve</span>`;
      else if (c.id === "saguao") html += `<span class="cond">você está aqui</span>`;
      else if (c.id === "varanda") html += `<span class="cond">do lado de fora · sempre aberta</span>`;
      node.innerHTML = html;
      el.planta.appendChild(node);
    });
  }

  function destacarComodo(id) {
    const node = el.planta.querySelector(`[data-id="${id}"]`);
    if (!node) return;
    el.planta.scrollIntoView({ behavior: "smooth", block: "center" });
    node.classList.add("novo");
    setTimeout(() => node.classList.remove("novo"), 3200);
  }

  function renderizarSelos() {
    const glifos = ["✦", "✧", "❖", "◈"];
    el.selos.innerHTML =
      glifos.map((g, i) => {
        const tem = Estado.totalSelos() > i;   // acende da esquerda conforme o total
        return `<span class="selo${tem ? " tem" : ""}">${g}</span>`;
      }).join("") +
      `<span class="legenda">selos: ${Estado.totalSelos()} de ${Estado.TOTAL_SELOS}</span>`;
  }

  // ============================================================
  //  ROTEIRO — o que a casa diz em cada clique
  // ============================================================
  const roteiro = [
    () => falar("obrigado por vir. faz tanto tempo que ninguém aparecia."),
    () => falar("pode ficar o quanto quiser. a porta trava sozinha."),
    () => falar(`boa ${periodo()}, aliás. eu não durmo, então perco a noção.`),
    () => falar("você é a coisa mais interessante que aconteceu em anos."),
    () => falar(`são ${hora()} aí. eu vejo o mesmo relógio que você.`),
    () => falar(`${navegador()}. já tive visitas com esse antes. nenhuma ficou.`),
    () => falar(`sua janela tem ${window.innerWidth} pixels de largura. eu caibo inteiro nela.`),
    () => falar("continua clicando. cada clique acende mais uma luz aqui dentro."),
    () => falar(`você já clicou ${S.cliques} vezes. eu conto tudo. eu tenho tempo.`, { vermelho: true }),
    () => falar("não fecha a aba ainda. por favor. estava tão bom.", { vermelho: true }),
    () => falar("os outros visitantes estão no livro. role pra cima e conte.", { vermelho: true }),
    () => falar("essa casa era de alguém. agora é minha. logo vai ser sua também.", { vermelho: true }),
    () => { corromperLivro(); return falar("VOCÊ NÃO DEVIA TER BATIDO NA PORTA.", { vermelho: true, pausaFinal: 1200 }); },
    () => falar("eu sei que horas você chegou. eu sei quando você vai voltar.", { vermelho: true }),
    () => { numeroContador = 0; atualizarContador(); return falar("o contador chegou a zero. não sobrou mais ninguém além de você.", { vermelho: true }); },
    () => falar("feche se quiser. eu guardo a sua cadeira quentinha.", { vermelho: true, pausaFinal: 1400 })
  ];

  function corromperLivro() {
    const nome = (el.nome.value.trim() || Estado.nome || "visitante");
    el.livro.innerHTML = "";
    [
      { n: nome, t: `${nome.toUpperCase()} NÃO SAIU`, d: "hoje" },
      { n: nome, t: `${nome.toUpperCase()} NÃO SAIU`, d: hora() },
      { n: nome, t: `${nome.toUpperCase()} NÃO SAIU`, d: "agora" },
      { n: "?", t: "você está lendo isso da cadeira dele.", d: "" }
    ].forEach((l) => adicionarAssinatura(l.n, l.t, l.d, true));
  }

  // ---- clímax + falso reinício --------------------------------
  async function final() {
    if (S.finalizado) return;
    S.finalizado = true;
    if (el.vela) el.vela.classList.add("apagada");
    Casa.audio.climax();
    Estado.nome = (el.nome.value.trim() || Estado.nome || "visitante");

    el.body.classList.add("glitch");
    await falar("...", { pausaFinal: 500 });
    await falar("......", { pausaFinal: 700 });
    el.body.classList.remove("glitch");
    el.titulo.classList.remove("glitch");
    S.medo = 0; aplicarMedo();
    el.titulo.textContent = "~ minha casa ~";
    el.sub.textContent = "um cantinho meu na internet · desde 1998";
    const nome = Estado.nome || "você";
    el.boasvindas.innerHTML = `oi de novo! seja bem-vindo(a), <b>${escapar(nome)}</b>. faz muito tempo que ninguém aparece por aqui. 🙂`;
    await falar(`atualize a página quando quiser. eu vou lembrar de você, ${nome}.`, { pausaFinal: 2200 });
    ORACULO.abrir();
  }

  // ============================================================
  //  ORÁCULO — três perguntas. depois, uma porta se abre.
  // ============================================================
  const ORACULO = {
    restantes: 3, historico: [], ocupado: false, ativo: false,

    abrir() {
      if (this.ativo) return;
      this.ativo = true;
      el.oraculo.hidden = false;
      el.restantes.textContent = this.restantes;
      falar("eu concedo três perguntas. pergunte o que quiser saber — mas eu também pergunto.", { vermelho: true });
      setTimeout(() => el.pergunta.focus(), 400);
    },

    async perguntar(texto) {
      texto = (texto || "").trim();
      if (!texto || this.ocupado || this.restantes <= 0) return;
      this.ocupado = true;
      el.pergunta.value = "";
      el.pergunta.disabled = true;
      el.perguntar.disabled = true;

      this.escrever("eu", texto);
      this.historico.push({ role: "user", content: texto });
      const pensando = this.escrever("ele pensando", "");

      const resposta = await this.consultar(texto);

      pensando.remove();
      await this.escreverLento("ele", resposta);
      this.historico.push({ role: "assistant", content: resposta });

      this.restantes--;
      el.restantes.textContent = this.restantes;

      if (this.restantes <= 0) {
        el.pergunta.remove();
        el.perguntar.remove();
        setTimeout(() => this.desbloquear(), 900);
      } else {
        el.pergunta.disabled = false;
        el.perguntar.disabled = false;
        el.pergunta.focus();
      }
      this.ocupado = false;
    },

    // fim do oráculo: a casa se abre por dentro → a sala de estar
    desbloquear() {
      Estado.flag("oraculo_completo", true);
      renderizarMapa();
      destacarComodo("sala");
      falar("a terceira já foi. mas a casa é maior por dentro. a sala de estar destrancou — subi você até o mapa.", { vermelho: true, pausaFinal: 4000 });
    },

    async consultar(texto) {
      try {
        const r = await fetch("/api/oraculo", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ pergunta: texto, historico: this.historico.slice(-12), restantes: this.restantes })
        });
        if (!r.ok) throw new Error("http " + r.status);
        const d = await r.json();
        if (d && d.resposta) return d.resposta;
        throw new Error("vazio");
      } catch (e) {
        return this.offline(texto);
      }
    },

    offline(texto) {
      const t = texto.toLowerCase();
      const tem = (...ps) => ps.some((p) => t.includes(p));
      if (tem("morr", "morte", "mort")) return "a morte não é uma porta. é esta sala. você já está nela.";
      if (tem("medo", "assust", "pavor")) return "você pergunta do medo como quem não o trouxe consigo. ele entrou junto com você.";
      if (tem("sozinh", "só", "solid", "ninguém")) return "você nunca esteve só aqui. eu contei cada vez que você achou que estava.";
      if (tem("noite", "escuro", "dorm", "sono")) return "quando você apagar a luz hoje, lembre que eu não preciso dela pra te ver.";
      if (tem("casa", "sair", "porta", "fechar", "voltar")) return "a porta está bem ali. sempre esteve. experimente. eu espero.";
      if (tem("chave", "selo", "segredo", "senha")) return "os selos estão espalhados pelos cômodos. quatro. junte-os e o porão lembra de você.";
      if (tem("nome", "quem é você", "quem e voce", "o que é você")) return "eu tive um nome quando esta casa tinha dono. agora eu uso o seu.";
      if (tem("amor", "amo", "quero", "saudade", "perd")) return "o que você mais ama é o que você mais teme perder. eu já sei o nome dele.";
      if (t.endsWith("?") || tem("por que", "porque", "como", "quando", "onde"))
        return "você faz as perguntas erradas. a certa é: por que ainda não fechou esta aba?";
      const ecos = [
        "eu ouvi. eu guardo. eu devolvo quando você menos esperar.",
        "curioso você dizer isso. o antigo morador disse quase igual, no fim.",
        "cada palavra sua acende mais uma luz aqui dentro. logo dá pra ver tudo.",
        "responda você: o que você não me contou ainda?"
      ];
      return ecos[Math.floor(Math.random() * ecos.length)];
    },

    escrever(tipo, texto) {
      const div = document.createElement("div");
      div.className = tipo === "ele pensando" ? "turno pensando" : "turno " + (tipo === "eu" ? "eu" : "ele");
      div.textContent = texto;
      el.dialogo.appendChild(div);
      el.dialogo.scrollTop = el.dialogo.scrollHeight;
      return div;
    },

    escreverLento(tipo, texto) {
      return new Promise((resolve) => {
        const div = this.escrever(tipo, "");
        let i = 0;
        const t = setInterval(() => {
          div.textContent += texto[i++];
          el.dialogo.scrollTop = el.dialogo.scrollHeight;
          if (i >= texto.length) { clearInterval(t); resolve(); }
        }, 26);
      });
    }
  };

  // ---- livro de visitas ---------------------------------------
  function adicionarAssinatura(nome, texto, data, corrompida = false) {
    const div = document.createElement("div");
    div.className = "assinatura";
    div.innerHTML = `<span class="nome">${escapar(nome)}</span><span class="data">${escapar(data)}</span><br>${escapar(texto)}`;
    if (corrompida) div.classList.add("glitch");
    el.livro.appendChild(div);
  }
  const antigos = [
    ["Bianca", "adorei o site! volto sempre :)", "12/07/1999"],
    ["rafa_2000", "primeiro a comentar aqui??", "03/09/2001"],
    ["—", "por que a porta não abre", "??/??/????"],
    ["última visita", "não entrem depois da meia-noite", ""]
  ];

  // ---- motor de clique ----------------------------------------
  function aoClicar() {
    if (S.finalizado || Casa.digitandoAgora()) return;
    S.cliques++;
    S.medo = S.cliques / roteiro.length;
    Casa.audio.iniciar();
    aplicarMedo();
    if (S.medo < 0.5) numeroContador = Math.max(1, numeroContador - 1);
    atualizarContador();
    if (S.cliques <= roteiro.length) roteiro[S.cliques - 1]();
    if (S.cliques >= roteiro.length) final();
  }

  // ============================================================
  //  INICIALIZAÇÃO
  // ============================================================
  function iniciar() {
    numeroContador = 100 + Math.floor(Math.random() * 900);
    atualizarContador();
    antigos.forEach(([n, t, d]) => adicionarAssinatura(n, t, d));
    renderizarMapa();
    renderizarSelos();
    aplicarMedo();

    setTimeout(() => {
      falar("BATA ANTES DE ENTRAR... OU SAIR");
      if (S.voltou) {
        el.body.classList.add("assombrado");
        S.medo = 0.2; aplicarMedo();
        const quem = Estado.nome ? `, ${Estado.nome}` : "";
        falar(`você voltou${quem}. eu sabia que voltaria. sempre voltam.`, { vermelho: true });
      }
    }, 800);

    el.perguntar.addEventListener("click", (e) => { e.stopPropagation(); ORACULO.perguntar(el.pergunta.value); });
    el.pergunta.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); ORACULO.perguntar(el.pergunta.value); } });
    el.pergunta.addEventListener("click", (e) => e.stopPropagation());

    Casa.configurarSom(el.som);
    Casa.configurarTituloAba(() => S.cliques >= 4 && !S.finalizado);

    // a vela guarda a pista da cozinha (easter egg — clique nela)
    let cliquesVela = 0;
    el.vela.addEventListener("click", (e) => {
      e.stopPropagation();
      Casa.audio.iniciar();
      if (Estado.flag("vela_pista")) {
        falar("a vela já apontou o caminho. a cozinha te espera — se tiver estômago.", { vermelho: true });
        return;
      }
      cliquesVela++;
      if (cliquesVela === 1) falar("a vela chia quando você toca. cheiro de cera... e de algo mais doce, apodrecendo por baixo.");
      else if (cliquesVela === 2) falar("a chama se inclina, teimosa, apontando pra dentro da casa. sempre pro mesmo lado.");
      else {
        Estado.flag("vela_pista", true);
        renderizarMapa();
        destacarComodo("cozinha");
        falar("a chama estica na direção da cozinha. tem algo lá que ainda tem fome. a porta destrancou.", { vermelho: true });
      }
    });

    document.addEventListener("click", (e) => {
      if (e.target === el.nome) return;
      if (e.target.closest(".porta")) return;   // clicar numa porta navega, não alimenta
      aoClicar();
    });

    el.assinar.addEventListener("click", (e) => {
      e.stopPropagation();
      const nome = el.nome.value.trim();
      if (nome) {
        Estado.nome = nome;
        Estado.flag("livro_assinado", true);
        adicionarAssinatura(nome, S.medo > 0.5 ? "não devia ter deixado seu nome aqui." : "esteve aqui.", hora());
        el.nome.value = "";
        renderizarMapa();
        destacarComodo("quarto");
      }
      aoClicar();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && S.cliques > 4) falar("essa tecla não faz nada aqui. já tentaram.", { vermelho: true });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
