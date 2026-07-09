/* ============================================================
   Corredor escuro — o quarto cômodo, a cola da casa. Você avança
   passo a passo até a porta sem maçaneta do porão. No fim, o
   selo IV e a instrução da fechadura: a hora em que tudo parou.
   Paleta fixa (body.corredor): sem Casa.medo, só áudio + susto.
   ============================================================ */

(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);

  Estado.marcarComodo("corredor");
  Casa.configurarSom($("#som"));
  Casa.configurarTituloAba(() => true);

  let entrou = false;
  function gesto() { if (entrou) return; entrou = true; Casa.audio.iniciar(); Casa.audio.reagir(0.6); }
  document.addEventListener("click", gesto);

  function renderSelos() {
    const glifos = ["✦", "✧", "❖", "◈"];
    $("#selos").innerHTML =
      glifos.map((g, i) => `<span class="selo${Estado.totalSelos() > i ? " tem" : ""}">${g}</span>`).join("") +
      `<span class="legenda">selos: ${Estado.totalSelos()} de ${Estado.TOTAL_SELOS}</span>`;
  }
  renderSelos();

  const passos = [
    "o corredor não tem fim à vista. você conta as portas: uma pra cada cômodo que já visitou. e mais algumas que você nunca abriu.",
    "a primeira porta à esquerda está morna. do outro lado, alguém range uma cadeira de trás pra frente. você não abre.",
    "no meio do caminho, o chão desce. as tábuas aqui são novas — alguém consertou isto por dentro, e faz pouco tempo.",
    "no fim, uma porta diferente das outras. sem maçaneta. só uma fechadura de três dígitos e, arranhado na madeira, um bilhete."
  ];

  const trilho = $("#trilho");
  const seguir = $("#seguir");
  let i = 0;

  function mostrar(txt) {
    const div = document.createElement("div");
    div.className = "passo";
    div.textContent = txt;
    trilho.appendChild(div);
    div.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  mostrar(passos[0]);

  setTimeout(() => {
    if (Estado.temSelo("corredor")) Casa.falar("você já andou por aqui. a porta do fim continua te esperando.");
    else Casa.falar("o corredor escuro. siga em frente. tem uma porta no fim que não é como as outras.");
  }, 700);

  seguir.addEventListener("click", (e) => {
    e.stopPropagation(); gesto();
    if (i < passos.length - 1) {
      i++;
      mostrar(passos[i]);
      if (i === passos.length - 1) seguir.textContent = "ler o bilhete";
    } else {
      seguir.hidden = true;
      revelarSelo();
    }
  });

  function revelarSelo() {
    Estado.coletarSelo("corredor");
    Estado.flag("porao_revelado", true);
    $("#selo").hidden = false;
    renderSelos();
    document.body.classList.add("assombrado");
    setTimeout(() => document.body.classList.remove("assombrado"), 1600);
    Casa.falar("o bilhete, na letra de quem tinha pressa: «a hora em que tudo parou». ◈. o quarto selo é seu. lá embaixo, a fechadura pede três números — e você já os tem.", { vermelho: true, pausaFinal: 3500 });
  }
})();
