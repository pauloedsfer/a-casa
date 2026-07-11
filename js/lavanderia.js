/* ============================================================
   Lavanderia — parece outro site: branco, limpo, moderno. Ao
   abrir os aparelhos, revela segredos mórbidos da família e a
   página se corrompe em sangue. Não dá selo, não liga ao porão:
   é pura expansão do lore. Destrava a "história da família".
   ============================================================ */

(() => {
  "use strict";

  // a fotografia do cômodo (artefato achado na casa)
  const FOTO = Foto.montar({
    destino: "#foto", id: "lavanderia",
    legenda: "lavanderia · sempre limpa",
    velado: "clique para ver a lavanderia onde você está",
    revelado: () => Estado.visitou("lavanderia")
  });
  FOTO.estagio(Estado.flag("lore_familia") ? 2 : 0);
  const $ = (s) => document.querySelector(s);

  // usa o motor só para marcar visita (o resto é bem custom aqui)
  Comodo.iniciar({ id: "lavanderia", som: false, selos: false, audio: false, intro: null, tituloAba: false });

  const achados = {
    lavar: {
      estado: "1 peça esquecida",
      titulo: "dentro da máquina de lavar",
      itens: [
        "um pijama infantil, tamanho 4 anos. lavado tantas vezes que a estampa sumiu.",
        "a etiqueta interna tem um nome escrito à caneta, por cima de outro nome apagado.",
        "a água da última lavagem nunca escoou. e não é água."
      ]
    },
    secar: {
      estado: "roupas ainda quentes",
      titulo: "dentro da secadora",
      itens: [
        "três conjuntos de roupa de cama pequenos, dobrados com cuidado. quentes, como se acabassem de sair.",
        "presos no filtro: fios de cabelo fino, claro. de mais de uma criança.",
        "no fundo do tambor, riscado no metal: «não contem pra mamãe que a gente ainda tá aqui»."
      ]
    }
  };

  let corrompido = false;
  let abertos = 0;

  function corromper() {
    if (!corrompido) {
      corrompido = true;
      document.body.classList.add("corrompida");
      $("#lav-intro").textContent = "algo aqui nunca terminou de lavar.";
      Casa.audio.iniciar();
      Casa.audio.reagir(0.55);
      Casa.configurarTituloAba(() => true);
      setTimeout(() => Casa.falar("você achou o cheiro que a casa escondia atrás do cloro.", { vermelho: true }), 400);
    }
    // espalha algumas manchas a cada abertura
    const m = $("#manchas");
    for (let i = 0; i < 5; i++) {
      const d = document.createElement("div");
      d.className = "mancha";
      const size = 60 + Math.random() * 180;
      d.style.width = d.style.height = size + "px";
      d.style.left = (Math.random() * 100) + "%";
      d.style.top = (Math.random() * 100) + "%";
      m.appendChild(d);
      requestAnimationFrame(() => d.classList.add("aberta"));
    }
  }

  function abrir(qual) {
    const btn = $("#" + qual);
    if (btn.classList.contains("aberto")) return;
    btn.classList.add("aberto");
    $("#estado-" + qual).textContent = achados[qual].estado;
    corromper();

    const a = achados[qual];
    const box = $("#achado");
    box.hidden = false;
    const bloco = document.createElement("div");
    bloco.innerHTML = `<div class="item"><b>${a.titulo}</b></div>` + a.itens.map((t) => `<div class="item">${t}</div>`).join("");
    box.appendChild(bloco);
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });

    abertos++;
    if (abertos >= 2) revelacaoFinal();
  }

  function revelacaoFinal() {
    Estado.flag("lore_familia", true);
    Estado.flag("chave_criancas", true);   // a chave do quarto delas
    FOTO.estagio(2);
    setTimeout(() => {
      Casa.falar("eram três. e no meio dos lençóis dobrados havia uma chave — a do quarto delas. esconderam ali porque a mãe nunca deixava de dobrar.", { vermelho: true, pausaFinal: 4500 });
      const box = $("#achado");
      const fim = document.createElement("div");
      fim.style.marginTop = "10px";
      fim.style.borderTop = "1px solid #7a2020";
      fim.style.paddingTop = "12px";
      fim.innerHTML =
        "<div class=\"item\">a lavanderia era o único cômodo que a mãe mantinha limpo. o único que ela ainda lavava, muito depois de não haver mais o que lavar.</div>" +
        "<div class=\"item\"><b>🔑 no fundo do cesto, entre os lençóis: uma chave pequena, de latão.</b><br>na etiqueta amarrada nela, em letra de criança: <i>«nosso quarto»</i>.</div>" +
        "<div class=\"item\">o quarto das crianças destrancou — está no mapa do saguão.</div>";
      box.appendChild(fim);
    }, 1600);
  }

  $("#lavar").addEventListener("click", (e) => { e.stopPropagation(); abrir("lavar"); });
  $("#secar").addEventListener("click", (e) => { e.stopPropagation(); abrir("secar"); });
})();
