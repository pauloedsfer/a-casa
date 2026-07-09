/* ============================================================
   Sala de estar — o primeiro cômodo além do vestíbulo.
   Guarda o selo I, escondido no retrato sem rosto. O relógio
   parado às 3h47 planta o primeiro número do código do porão.
   ============================================================ */

(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);

  Estado.marcarComodo("sala");
  Casa.configurarSom($("#som"));
  Casa.configurarTituloAba(() => true);

  let entrou = false;
  function gesto() { if (entrou) return; entrou = true; Casa.audio.iniciar(); Casa.medo(0.35); }
  document.addEventListener("click", gesto);

  function renderSelos() {
    const glifos = ["✦", "✧", "❖", "◈"];
    $("#selos").innerHTML =
      glifos.map((g, i) => `<span class="selo${Estado.totalSelos() > i ? " tem" : ""}">${g}</span>`).join("") +
      `<span class="legenda">selos: ${Estado.totalSelos()} de ${Estado.TOTAL_SELOS}</span>`;
  }
  renderSelos();

  setTimeout(() => {
    Casa.medo(0.3);
    if (Estado.temSelo("sala")) Casa.falar("você já esteve aqui. o retrato sem rosto ainda te encara.", { vermelho: true });
    else Casa.falar("a sala de estar. três retratos. os olhos seguem você. um deles não tem rosto.");
  }, 700);

  // retratos com rosto → migalhas de lore (deixadas em aberto de propósito)
  const falasRetrato = [
    "o homem de terno. a placa diz 'fundador'. o ano foi arrancado com a unha.",
    "ela segura algo que a foto não mostra. uma chave, talvez. ou a mão de alguém."
  ];
  document.querySelectorAll(".retrato:not(.sem-rosto)").forEach((r, i) => {
    r.addEventListener("click", (e) => { e.stopPropagation(); gesto(); Casa.falar(falasRetrato[i % falasRetrato.length]); });
  });

  // retrato sem rosto → selo I
  $("#retrato-sem-rosto").addEventListener("click", (e) => { e.stopPropagation(); gesto(); revelarSelo(); });

  function revelarSelo() {
    const jaTinha = Estado.temSelo("sala");
    Estado.coletarSelo("sala");
    Estado.flag("codigo_1", "3");
    $("#selo").hidden = false;
    Casa.medo(0.55);
    renderSelos();
    if (jaTinha) Casa.falar("você já levou o que havia sob a tinta. ✦. o primeiro número era 3. ainda é.", { vermelho: true });
    else Casa.falar("sob a tinta raspada, um sinal aceso: ✦. guarde o primeiro número — 3. o porão vai pedir.", { vermelho: true });
  }

  // relógio parado
  $("#relogio").addEventListener("click", (e) => {
    e.stopPropagation(); gesto();
    Casa.falar("o relógio parou às 3h47. foi quando aconteceu. ninguém nunca disse o quê.", { vermelho: true });
  });
})();
