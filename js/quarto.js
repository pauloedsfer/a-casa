/* ============================================================
   Quarto — o segundo cômodo. Um diário de 1998 cujas páginas
   se corrompem conforme você as vira. A última revela o selo II
   e o segundo número do código do porão. As entradas amarram
   o relógio (3h47), o livro de visitas e a mitologia da casa.
   ============================================================ */

(() => {
  "use strict";

  // a fotografia do cômodo (artefato achado na casa)
  const FOTO = Foto.montar({
    destino: "#foto", id: "quarto",
    legenda: "quarto do casal · 1998",
    velado: "clique para ver o quarto onde você está",
    revelado: () => Estado.visitou("quarto")
  });
  FOTO.estagio(Estado.temSelo("quarto") ? 2 : 0);
  const $ = (s) => document.querySelector(s);

  Estado.marcarComodo("quarto");
  Casa.configurarSom($("#som"));
  Casa.configurarTituloAba(() => true);

  let entrou = false;
  function gesto() { if (entrou) return; entrou = true; Casa.audio.iniciar(); Casa.medo(0.4); }
  document.addEventListener("click", gesto);

  function renderSelos() {
    const glifos = ["✦", "✧", "❖", "◈"];
    $("#selos").innerHTML =
      glifos.map((g, i) => `<span class="selo${Estado.totalSelos() > i ? " tem" : ""}">${g}</span>`).join("") +
      `<span class="legenda">selos: ${Estado.totalSelos()} de ${Estado.TOTAL_SELOS}</span>`;
  }
  renderSelos();

  const entradas = [
    "12 de março de 1998. mudamos pra casa da colina. o porão é maior do que a planta mostra. o corretor riu quando eu comentei.",
    "2 de junho. o antigo dono deixou cadernos. ele escrevia sobre 'ensinar a casa a lembrar das pessoas'. na época achei poético.",
    "9 de setembro. as luzes acendem sozinhas — sempre onde a gente pisou de dia. como se a casa repetisse a gente à noite.",
    "3h47. não consigo mais escrever a data. só a hora. sempre a mesma hora. se você está lendo isto, não assine o liv—"
  ];

  const area = $("#diario");
  const botao = $("#virar");
  let i = 0;
  let atual = null;

  function mostrar(txt) {
    atual = document.createElement("div");
    atual.className = "entrada";
    atual.textContent = txt;
    area.appendChild(atual);
    area.scrollTop = area.scrollHeight;
  }

  const lixo = "█▓▒░";
  function corromper(node) {
    if (!node) return;
    node.classList.add("glitch", "corrompida");
    node.textContent = node.textContent.split("").map((c) =>
      c === " " ? c : (Math.random() < 0.45 ? lixo[Math.floor(Math.random() * lixo.length)] : c)
    ).join("");
  }

  botao.addEventListener("click", (e) => {
    e.stopPropagation(); gesto();
    corromper(atual);
    i++;
    if (i < entradas.length) mostrar(entradas[i]);
    else { botao.hidden = true; revelarSelo(); }
  });

  function revelarSelo() {
    const jaTinha = Estado.temSelo("quarto");
    Estado.coletarSelo("quarto");
    FOTO.estagio(2);
    Estado.flag("codigo_2", "4");
    $("#selo").hidden = false;
    Casa.medo(0.6);
    renderSelos();
    if (jaTinha) Casa.falar("a última página some toda vez. ✧. o segundo número era 4.", { vermelho: true });
    else Casa.falar("a última página não termina. a mão parou no meio da palavra. ✧. o segundo número — 4. ele estava avisando você, e você continuou virando as páginas assim mesmo.", { vermelho: true });
  }

  // início
  mostrar(entradas[0]);
  setTimeout(() => {
    Casa.medo(0.38);
    if (Estado.temSelo("quarto")) Casa.falar("você já leu tudo. as páginas não melhoram na segunda vez.", { vermelho: true });
    else Casa.falar("a cama está feita. o diário está aberto na página exata em que você chegou. vire — ele foi deixado ali pra você.");
  }, 700);
})();
