/* ============================================================
   Abertura — a porta em tela cheia. Bater três vezes abre a casa
   e dispara o evento "casa:entrou". O primeiro toque também é o
   gesto que libera o áudio (por isso o som funciona daqui pra frente).
   ============================================================ */

(() => {
  "use strict";
  const overlay = document.getElementById("porta-overlay");
  if (!overlay) return;

  const folha = document.getElementById("porta-folha");
  const luz = document.getElementById("porta-luz");
  const legenda = document.getElementById("porta-legenda");
  let batidas = 0;
  let abrindo = false;

  function knock() {
    Casa.audio.iniciar();                 // gesto do usuário libera o áudio
    Casa.audio.batida(150, 0.07, 0.35);
    setTimeout(() => Casa.audio.batida(112, 0.08, 0.30), 110);
  }

  overlay.addEventListener("click", (e) => {
    e.stopPropagation();                  // não vaza pro jogo por trás
    if (abrindo) return;
    batidas++;
    knock();
    folha.classList.remove("treme"); void folha.offsetWidth; folha.classList.add("treme");
    luz.style.opacity = String(Math.min(0.15 + batidas * 0.18, 0.7));
    if (batidas === 1) legenda.textContent = "de novo.";
    else if (batidas === 2) legenda.textContent = "mais uma.";
    else abrir();
  });

  function abrir() {
    abrindo = true;
    legenda.textContent = "";
    folha.classList.remove("treme");
    luz.style.opacity = "1";
    Casa.audio.batida(58, 1.2, 0.42);     // baque grave: a porta cede
    overlay.classList.add("abrindo");
    setTimeout(() => {
      overlay.remove();
      window.dispatchEvent(new Event("casa:entrou"));
    }, 1350);
  }
})();
