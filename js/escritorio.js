/* ============================================================
   Escritório — o cômodo do pai. Nove livros na estante; quatro
   trazem marcações a lápis de um VISITANTE que se perdeu na casa
   (o mesmo tom do diário do quarto). Cada marcação esconde um
   dígito. Juntos: 1998 — a senha do computador do sótão.
   ============================================================ */

(() => {
  "use strict";

  // a fotografia do cômodo (artefato achado na casa)
  const FOTO = Foto.montar({
    destino: "#foto", id: "escritorio",
    legenda: "escritório · a mesa dele",
    velado: "clique para ver o escritório onde você está",
    revelado: () => Estado.visitou("escritorio")
  });
  FOTO.estagio(Estado.flag("senha_sotao") ? 2 : 0);
  const $ = (s) => document.querySelector(s);

  Comodo.iniciar({
    id: "escritorio", medo: 0.35, aplicarMedo: true, selos: false,
    intro: "o escritório do pai. quatro livros estão marcados — e a letra não é dele.",
    introRevisita: "você já leu as marcações. o visitante que as escreveu nunca saiu daqui.",
    jaFez: () => Estado.flag("senha_sotao")
  });

  // 9 livros; os 4 marcados carregam os dígitos, na ordem do lombo
  const LIVROS = [
    { t: "Tratado de Autômatos", marcado: false },
    { t: "A Casa e a Memória", digito: "1", nota: "página dobrada. a lápis, na margem: <span class=\"cit\">«ele não construiu um servo. construiu uma coleira — e algo entrou nela.»</span> o número da página está circulado: <b>1</b>." },
    { t: "Sistemas de Relés", marcado: false },
    { t: "Hospitalidade", digito: "9", nota: "sublinhado com força: <span class=\"cit\">«a casa recebe. a casa registra. a casa não devolve.»</span> ao lado, um <b>9</b> rabiscado três vezes." },
    { t: "Cadernos de Campo", marcado: false },
    { t: "O Hóspede Permanente", digito: "9", nota: "a letra aqui treme: <span class=\"cit\">«dia 40. as portas obedecem a ela, não a mim. o mecanismo é só a mão. a mão não é a vontade.»</span> canto da página: <b>9</b>." },
    { t: "Manual do Proprietário", marcado: false },
    { t: "Últimas Vontades", digito: "8", nota: "a última anotação, quase ilegível: <span class=\"cit\">«se você está lendo isto, já bateu duas vezes. eu bati também. a senha é o ano — ela deixou que eu soubesse. acho que ela quer que alguém veja o sótão.»</span> e um <b>8</b>." },
    { t: "Almanaque 1998", marcado: false }
  ];

  const estante = $("#estante");
  const marcado = $("#marcado");
  let lidos = 0;

  LIVROS.forEach((l, i) => {
    const b = document.createElement("button");
    b.className = "livro";
    b.style.height = (78 + ((i * 13) % 26)) + "px";
    b.innerHTML = `<span class="lombada">${l.t}</span>`;
    b.addEventListener("click", (e) => { e.stopPropagation(); abrir(l, b); });
    estante.appendChild(b);
  });

  function abrir(l, b) {
    if (!l.digito) {
      Casa.falar("um livro comum. páginas amareladas, nenhuma marca. o pai lia muito — mas não era ele quem escrevia nas margens.");
      return;
    }
    if (b.classList.contains("lido")) return;
    b.classList.add("lido");

    const d = document.createElement("div");
    d.className = "nota";
    d.innerHTML = `<b>${l.t}</b> — ${l.nota}`;
    marcado.appendChild(d);
    d.scrollIntoView({ behavior: "smooth", block: "nearest" });

    lidos++;
    if (lidos >= 4) revelar();
  }

  function revelar() {
    Estado.flag("senha_sotao", true);
    FOTO.estagio(2);
    $("#senha-final").hidden = false;
    Casa.medo(0.55);
    Casa.falar("1998. o ano em que tudo parou de andar pra frente. o sótão destrancou — e eu deixei.", { vermelho: true, pausaFinal: 4200 });
  }

  // se já resolveu antes, mostra tudo de novo
  if (Estado.flag("senha_sotao")) {
    LIVROS.forEach((l, i) => { if (l.digito) estante.children[i].classList.add("lido"); });
    $("#senha-final").hidden = false;
  }
})();
