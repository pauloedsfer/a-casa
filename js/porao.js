/* ============================================================
   Porão — o fundo da casa. A fechadura pede a hora em que tudo
   parou (3-4-7, do relógio da sala). Acertando, a casa se abre
   por dentro: a revelação final e o gancho para A Mansão.
   ============================================================ */

(() => {
  "use strict";

  // a fotografia do cômodo (artefato achado na casa)
  const FOTO = Foto.montar({
    destino: "#foto", id: "porao",
    legenda: "porão · o fundo da casa",
    velado: "clique para ver o porão onde você está",
    revelado: () => Estado.visitou("porao")
  });
  FOTO.estagio(Estado.flag("final_visto") ? 2 : 0);
  const $ = (s) => document.querySelector(s);

  Estado.marcarComodo("porao");
  Casa.configurarSom($("#som"));
  Casa.configurarTituloAba(() => !Estado.flag("final_visto"));

  // a senha é a hora do relógio (selos I-II-III). derivamos do save,
  // com 347 como reforço caso algum flag não exista.
  const SENHA = ((Estado.flag("codigo_1") || "3") + (Estado.flag("codigo_2") || "4") + (Estado.flag("codigo_3") || "7"));

  let entrou = false;
  function gesto() { if (entrou) return; entrou = true; Casa.audio.iniciar(); Casa.audio.reagir(0.85); }
  document.addEventListener("click", gesto);

  setTimeout(() => {
    if (Estado.flag("final_visto")) Casa.falar("você já desceu até aqui. a porta continua aberta. ela sempre vai continuar.", { vermelho: true });
    else Casa.falar("o porão. a fechadura pede três números. você os carrega desde a sala.", { vermelho: true });
  }, 700);

  const visor = $("#visor");
  let buffer = "";

  function pintarVisor() {
    const casas = visor.querySelectorAll("span");
    for (let k = 0; k < 3; k++) casas[k].textContent = buffer[k] || "_";
  }

  $("#teclado").addEventListener("click", (e) => {
    e.stopPropagation(); gesto();
    const btn = e.target.closest("button");
    if (!btn) return;
    if (btn.id === "limpar") { buffer = ""; pintarVisor(); return; }
    if (btn.id === "destrancar") { tentar(); return; }
    if (btn.dataset.n && buffer.length < 3) { buffer += btn.dataset.n; pintarVisor(); }
  });

  function tentar() {
    if (buffer.length < 3) { Casa.falar("faltam números. a porta não abre pela metade."); return; }
    if (buffer === SENHA) { abrir(); }
    else {
      visor.classList.add("erro");
      Casa.audio.batida(48, 0.5, 0.28);
      Casa.falar("essa não é a hora. a casa parou numa hora só — e você já a viu.", { vermelho: true });
      setTimeout(() => { visor.classList.remove("erro"); buffer = ""; pintarVisor(); }, 700);
    }
  }

  function abrir() {
    Estado.flag("final_visto", true);
    FOTO.estagio(2);
    Casa.audio.climax();
    document.body.classList.add("assombrado");
    setTimeout(() => document.body.classList.remove("assombrado"), 2000);
    $("#caixa-fechadura").hidden = true;

    const blocos = [
      "a fechadura cede no terceiro número. a porta não abre pra fora — abre pra baixo.",
      "não há porão. há uma escada que desce mais fundo do que a colina permite, e o ar que sobe dela é morno, como hálito.",
      "no fim dela, uma sala idêntica a este saguão. a mesma vela. o mesmo livro de visitas aberto. e o seu nome já está lá — com a letra que você usou hoje.",
      "abaixo do seu nome há uma data. não é a de hoje. é uma que ainda não chegou, e está perto o bastante pra você reconhecer o mês.",
      "eu não te trouxe aqui pra te assustar. eu te trouxe pra te ensinar o caminho — porque um dia você vai precisar dele, e vai vir sozinho.",
      "— e esta casa sempre foi a menor das duas. a caseira. quem dava as ordens mora no alto da colina, e ainda está esperando alguém bater."
    ];

    const rev = $("#revelacao");
    rev.hidden = false;
    blocos.forEach((txt, k) => {
      const div = document.createElement("div");
      div.className = "bloco";
      div.textContent = txt;
      rev.appendChild(div);
      setTimeout(() => div.classList.add("vem"), 400 + k * 1400);
    });

    // o gancho para A Mansão
    setTimeout(() => {
      const g = document.createElement("div");
      g.className = "gancho";
      g.innerHTML =
        '<div class="titulo">RECKNOCKING II — THE MANSION</div>' +
        '<div class="em-breve">em breve · se você tiver coragem de bater de novo</div>' +
        '<button id="bater">bater na porta da mansão</button>';
      rev.appendChild(g);
      $("#bater").addEventListener("click", (e) => {
        e.stopPropagation();
        Casa.falar("a mansão ainda não recebe visitas. ela está aprendendo a lembrar de você primeiro.", { vermelho: true });
      });
    }, 400 + blocos.length * 1400 + 600);

    pintarVisor();
  }
})();
