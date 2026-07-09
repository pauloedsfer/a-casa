/* ============================================================
   Cozinha — o terceiro cômodo. A panela no fogão esconde o
   selo III (número 7). Destampá-la solta um enxame de baratas.
   Paleta suja fixa (body.cozinha): NÃO chamamos Casa.medo, que
   sobrescreveria as cores. Usamos só o áudio de terror e um
   tremor pontual no susto.
   ============================================================ */

(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);

  Estado.marcarComodo("cozinha");
  Casa.configurarSom($("#som"));
  Casa.configurarTituloAba(() => true);

  let entrou = false;
  function gesto() { if (entrou) return; entrou = true; Casa.audio.iniciar(); Casa.audio.reagir(0.5); }
  document.addEventListener("click", gesto);

  function renderSelos() {
    const glifos = ["✦", "✧", "❖", "◈"];
    $("#selos").innerHTML =
      glifos.map((g, i) => `<span class="selo${Estado.totalSelos() > i ? " tem" : ""}">${g}</span>`).join("") +
      `<span class="legenda">selos: ${Estado.totalSelos()} de ${Estado.TOTAL_SELOS}</span>`;
  }
  renderSelos();

  setTimeout(() => {
    if (Estado.temSelo("cozinha")) Casa.falar("você já viu o que mora na panela. ele lembra de você.");
    else Casa.falar("a cozinha. a panela no fogão está tampada — e não devia estar se mexendo.");
  }, 700);

  const panela = $("#panela");
  let aberta = false;

  panela.addEventListener("click", (e) => { e.stopPropagation(); gesto(); destampar(); });

  function destampar() {
    if (aberta) { Casa.falar("elas voltaram pro fundo assim que você piscou. o sinal continua lá."); return; }
    aberta = true;
    panela.classList.add("aberta");
    soltarBaratas();
    document.body.classList.add("assombrado");                 // tremor de susto
    setTimeout(() => document.body.classList.remove("assombrado"), 1400);
    revelarSelo();
  }

  function soltarBaratas() {
    const enx = $("#enxame");
    for (let i = 0; i < 18; i++) {
      const b = document.createElement("div");
      b.className = "barata";
      enx.appendChild(b);
      requestAnimationFrame(() => {
        const ang = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 100;
        b.style.transform = `translate(${Math.cos(ang) * dist}px, ${Math.sin(ang) * dist}px) rotate(${Math.random() * 360}deg)`;
        b.style.opacity = "0";
      });
      setTimeout(() => b.remove(), 950);
    }
  }

  function revelarSelo() {
    const jaTinha = Estado.temSelo("cozinha");
    Estado.coletarSelo("cozinha");
    Estado.flag("codigo_3", "7");
    $("#selo").hidden = false;
    renderSelos();
    setTimeout(() => {
      if (jaTinha) Casa.falar("no fundo, sob a gordura endurecida: ❖. o terceiro número era 7.", { vermelho: true });
      else Casa.falar("gravado fundo na chapa, sob a crosta: ❖. o terceiro número — 7. três... quatro... sete. o relógio da sala, lembra?", { vermelho: true });
    }, 950);
  }

  // ambientação clicável
  const falas = {
    geladeira: "você abre a geladeira. a luz não acende há anos. o cheiro sai sozinho — doce, escuro, e de algum jeito ainda quente.",
    despensa: "potes sem rótulo, todos cheios. um deles bate devagar contra o vidro, por dentro.",
    pia: "a água ficou parada tanto tempo que virou espelho. você se vê nela. e mais alguém, atrás de você."
  };
  Object.keys(falas).forEach((id) => {
    const n = document.getElementById(id);
    if (n) n.addEventListener("click", (e) => { e.stopPropagation(); gesto(); Casa.falar(falas[id]); });
  });
})();
