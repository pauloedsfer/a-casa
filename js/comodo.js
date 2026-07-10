/* ============================================================
   Comodo — motor compartilhado para os cômodos padrão.
   Encapsula o que todo cômodo repetia: marcar visita, configurar
   som e título da aba, o "primeiro gesto" (áudio/medo), o contador
   de selos e a fala de introdução. Cada cômodo novo fica enxuto.

   Uso mínimo:
     Comodo.iniciar({ id: "escritorio", medo: 0.35,
       intro: "o escritório do pai. cheira a charuto e madeira.",
       introRevisita: "você já revirou estas gavetas." });
   ============================================================ */

window.Comodo = {
  iniciar(opts) {
    const $ = (s) => document.querySelector(s);
    Estado.marcarComodo(opts.id);

    if (opts.som !== false && $("#som")) Casa.configurarSom($("#som"));
    if (opts.tituloAba !== false) Casa.configurarTituloAba(opts.tituloCond || (() => true));

    let entrou = false;
    const gesto = () => {
      if (entrou) return;
      entrou = true;
      if (opts.audio !== false) Casa.audio.iniciar();
      if (opts.medo != null) {
        if (opts.aplicarMedo) Casa.medo(opts.medo);   // cômodos verdes
        else Casa.audio.reagir(opts.medo);            // cômodos de paleta fixa: só som
      }
      if (opts.aoEntrar) opts.aoEntrar();
    };
    document.addEventListener("click", gesto);

    if (opts.selos !== false) this.renderSelos();

    if (opts.intro !== null) {
      setTimeout(() => {
        if (opts.aplicarMedo && opts.medo != null) Casa.medo(opts.medo);
        const jaFez = opts.jaFez ? opts.jaFez() : false;
        const texto = jaFez && opts.introRevisita ? opts.introRevisita : opts.intro;
        if (texto) Casa.falar(texto, opts.introVermelho ? { vermelho: true } : {});
      }, opts.introDelay || 700);
    }

    return { $, gesto };
  },

  renderSelos() {
    const el = document.querySelector("#selos");
    if (!el) return;
    const g = ["✦", "✧", "❖", "◈"];
    el.innerHTML =
      g.map((x, i) => `<span class="selo${Estado.totalSelos() > i ? " tem" : ""}">${x}</span>`).join("") +
      `<span class="legenda">selos: ${Estado.totalSelos()} de ${Estado.TOTAL_SELOS}</span>`;
  }
};
