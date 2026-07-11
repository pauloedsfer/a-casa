/* ============================================================
   Foto — a fotografia do cômodo, tratada como um artefato achado
   na casa (não como papel de parede). Começa velada: o jogador
   clica para revelar. Cada cômodo tem até 3 variações, trocadas
   conforme o segredo é descoberto:

     0 · limpa  — o cômodo como era
     1 · tensa  — algo mudou de lugar
     2 · podre  — depois que o segredo veio à tona

   Se o arquivo de imagem não existir, o componente se degrada
   com elegância: mostra a legenda e não quebra nada.

   Uso:
     const f = Foto.montar({
       destino: "#foto",
       id: "sala",                    // procura img/sala-0.jpg, -1, -2
       legenda: "sala de estar · 1998",
       velado: "clique para ver o cômodo onde você está",
       revelado: () => Estado.visitou("sala")   // opcional: já vem aberta
     });
     f.estagio(2);   // troca a imagem quando o selo é achado
   ============================================================ */

window.Foto = {
  montar(opts) {
    const alvo = document.querySelector(opts.destino);
    if (!alvo) return { estagio() {}, revelar() {} };

    const base = (opts.pasta || "../img/") + opts.id;
    const ext = opts.ext || ".jpg";

    const fig = document.createElement("div");
    fig.className = "foto";
    fig.innerHTML =
      '<div class="quadro">' +
        `<img id="img-${opts.id}" alt="" loading="lazy" src="${base}-0${ext}">` +
        `<div class="veu">${opts.velado || "clique para ver o cômodo onde você está"}</div>` +
      '</div>' +
      `<div class="legenda-foto">${opts.legenda || ""}</div>`;
    alvo.appendChild(fig);

    const img = fig.querySelector("img");
    let estagioAtual = 0;
    let revelada = false;

    // sem arquivo? some com a imagem, mantém a moldura e a legenda.
    img.addEventListener("error", () => { img.style.opacity = "0"; }, { once: false });

    function revelar() {
      if (revelada) return;
      revelada = true;
      fig.classList.add("revelada");
      if (opts.aoRevelar) opts.aoRevelar();
    }

    fig.addEventListener("click", (e) => { e.stopPropagation(); revelar(); });

    // já visitou antes? a foto já vem revelada.
    if (opts.revelado && opts.revelado()) {
      revelada = true;
      fig.classList.add("revelada");
    }

    return {
      revelar,
      // troca a variação e a degradação visual
      estagio(n) {
        if (n === estagioAtual) return;
        estagioAtual = n;
        fig.classList.toggle("tensa", n === 1);
        fig.classList.toggle("podre", n >= 2);
        img.style.opacity = "0";
        setTimeout(() => {
          img.src = `${base}-${n}${ext}`;
          img.style.opacity = "1";
        }, 450);
        revelar();
      },
      elemento: fig
    };
  }
};
