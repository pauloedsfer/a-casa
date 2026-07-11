/* ============================================================
   Sala de estar — o primeiro cômodo além do vestíbulo.
   Guarda o selo I, escondido no retrato sem rosto. O relógio
   parado às 3h47 planta o primeiro número do código do porão.
   ============================================================ */

(() => {
  "use strict";

  // a fotografia do cômodo (artefato achado na casa)
  const FOTO = Foto.montar({
    destino: "#foto", id: "sala",
    legenda: "sala de estar · retratos da família",
    velado: "clique para ver a sala onde você está",
    revelado: () => Estado.visitou("sala")
  });
  FOTO.estagio(Estado.temSelo("sala") ? 2 : 0);
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
  if (Estado.temSelo("sala")) {
    const rv = document.getElementById("retrato-sem-rosto");
    if (rv) rv.classList.add("revelado");
  }

  setTimeout(() => {
    Casa.medo(0.3);
    if (Estado.temSelo("sala")) Casa.falar("você já esteve aqui. a caveira do retrato ainda te encara.", { vermelho: true });
    else Casa.falar("três retratos. dois te olham. o do meio foi raspado até o osso da parede — e mesmo assim é ele que está te olhando mais.");
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
    FOTO.estagio(2);
    Estado.flag("codigo_1", "3");
    const r = document.getElementById("retrato-sem-rosto");
    if (r) r.classList.add("revelado");
    $("#selo").hidden = false;
    Casa.medo(0.55);
    renderSelos();
    if (jaTinha) Casa.falar("a caveira continua ali, sob a tinta. ✦. o primeiro número era 3. ainda é.", { vermelho: true });
    else Casa.falar("a tinta sai fácil. embaixo não há rosto — há um crânio, e ele está sorrindo do jeito que todo crânio sorri. ✦. o primeiro número é 3. o retrato do meio nunca teve dono: é onde a casa guarda o rosto de quem ainda vai ficar.", { vermelho: true });
  }

  // relógio parado
  $("#relogio").addEventListener("click", (e) => {
    e.stopPropagation(); gesto();
    Casa.falar("3h47. o relógio parou aí e nunca mais andou. em algum lugar da sua vida também tem uma hora dessas — você só ainda não sabe qual.", { vermelho: true });
  });
})();
