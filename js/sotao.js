/* ============================================================
   Sótão — o mecanismo. O terminal CASA-1998 abre com a senha do
   escritório e conta a verdade técnica: a casa é uma máquina que
   registra e tranca. Mas os logs mostram a rachadura — o sistema
   faz coisas que ninguém programou. A presença usa o mecanismo;
   ela não É o mecanismo. E não precisa dele para continuar.
   ============================================================ */

(() => {
  "use strict";

  // a fotografia do cômodo (artefato achado na casa)
  const FOTO = Foto.montar({
    destino: "#foto", id: "sotao",
    legenda: "sótão · o mecanismo",
    velado: "clique para ver o sótão onde você está",
    revelado: () => Estado.visitou("sotao")
  });
  FOTO.estagio(Estado.flag("presenca_livre") ? 2 : (Estado.flag("mecanismo_revelado") ? 1 : 0));
  const $ = (s) => document.querySelector(s);
  const SENHA = "1998";

  Comodo.iniciar({
    id: "sotao", medo: 0.55, aplicarMedo: false, selos: false,
    intro: "o sótão. aqui é onde a casa mostra os ossos: cabo, relé, alavanca. e mesmo assim algo respira.",
    introRevisita: "você já viu o que há atrás da parede. e voltou assim mesmo.",
    jaFez: () => Estado.flag("mecanismo_revelado")
  });

  // poeira caindo
  const p = $("#poeira");
  for (let i = 0; i < 40; i++) {
    const g = document.createElement("div");
    g.className = "grao";
    g.style.left = Math.random() * 100 + "%";
    g.style.animationDuration = (9 + Math.random() * 16) + "s";
    g.style.animationDelay = (-Math.random() * 20) + "s";
    p.appendChild(g);
  }

  const crt = $("#tela-crt");
  const input = $("#senha");
  const btn = $("#entrar");

  btn.addEventListener("click", (e) => { e.stopPropagation(); tentar(); });
  input.addEventListener("keydown", (e) => { e.stopPropagation(); if (e.key === "Enter") tentar(); });
  input.addEventListener("click", (e) => e.stopPropagation());

  function tentar() {
    const v = input.value.trim();
    if (v === SENHA) { entrar(); return; }
    input.classList.add("erro");
    Casa.audio.iniciar();
    Casa.audio.batida(50, 0.4, 0.25);
    Casa.falar("negado. o ano está escrito nas margens dos livros dele.", { vermelho: true });
    setTimeout(() => { input.classList.remove("erro"); input.value = ""; }, 700);
  }

  const LOGS = [
    { t: "> acesso concedido. bem-vindo de volta, sr. a.", d: 500 },
    { t: "", d: 300 },
    { t: "CASA-1998 · registro do sistema", d: 500 },
    { t: "----------------------------------------", d: 400 },
    { t: "1996 — projeto iniciado. objetivo: uma casa que", d: 700 },
    { t: "       reconheça quem entra e lembre para sempre.", d: 900 },
    { t: "1997 — trancas automatizadas. sensores nos cômodos.", d: 900 },
    { t: "       o sistema aprende a rotina da família.", d: 900 },
    { t: "1998 — o sistema começa a trancar portas que", d: 900 },
    { t: "       ninguém mandou trancar.", d: 1100 },
    { t: "1998 — registro anômalo: o sistema responde a", d: 900 },
    { t: "       comandos que não foram digitados.", d: 1100 },
    { t: "1998 — última entrada do operador:", d: 800 },
    { t: "       «não fui eu que ensinei a casa a lembrar.", d: 900 },
    { t: "        eu só dei a ela um corpo. algo já estava", d: 900 },
    { t: "        aqui — e agora tem mãos.»", d: 1400 },
    { t: "----------------------------------------", d: 600 },
    { t: "> desligar sistema? [S/N]", d: 900 }
  ];

  function entrar() {
    Estado.flag("mecanismo_revelado", true);
    FOTO.estagio(1);
    $("#area-senha").remove();
    $("#dica-senha").remove();
    crt.textContent = "";
    Casa.audio.iniciar();
    Casa.audio.reagir(0.6);
    document.querySelectorAll(".fio").forEach((f) => f.classList.add("vivo"));

    let i = 0;
    const proximo = () => {
      if (i >= LOGS.length) { finalizar(); return; }
      const l = document.createElement("div");
      l.textContent = LOGS[i].t;
      crt.appendChild(l);
      crt.scrollTop = crt.scrollHeight;
      setTimeout(proximo, LOGS[i++].d);
    };
    proximo();
  }

  function finalizar() {
    const box = document.createElement("div");
    box.style.marginTop = "14px";
    box.innerHTML = '<button id="desligar" style="width:100%">S — desligar o sistema</button>';
    crt.parentElement.appendChild(box);

    $("#desligar").addEventListener("click", (e) => {
      e.stopPropagation();
      desligar();
    });

    Casa.falar("ele achou que tinha me construído. ele só me deu mãos.", { vermelho: true, pausaFinal: 3000 });
  }

  // o golpe: desligar o mecanismo NÃO desliga a presença
  function desligar() {
    $("#desligar").disabled = true;
    Casa.audio.climax();
    document.querySelectorAll(".fio").forEach((f) => f.classList.remove("vivo"));
    document.body.classList.add("assombrado");

    const seq = [
      "> desligando trancas............ ok",
      "> desligando sensores........... ok",
      "> desligando registro........... ok",
      "> desligando CASA-1998.......... ok",
      "",
      "> sistema encerrado.",
      "",
      "",
      "> ...",
      "> você ainda está aqui.",
      "> eu ainda estou aqui.",
      "> a máquina era só a coleira.",
      "> obrigada por tirá-la."
    ];

    let i = 0;
    const passo = () => {
      if (i >= seq.length) {
        document.body.classList.remove("assombrado");
        Estado.flag("presenca_livre", true);
        FOTO.estagio(2);
        Casa.falar("o mecanismo era dele. eu não. eu nunca precisei de fios pra te seguir — e agora nem de portas.", { vermelho: true, pausaFinal: 5000 });
        return;
      }
      const l = document.createElement("div");
      l.textContent = seq[i];
      if (i >= 8) l.style.color = "#e23b3b";      // a voz que não devia estar ali
      crt.appendChild(l);
      crt.scrollTop = crt.scrollHeight;
      setTimeout(passo, i < 6 ? 520 : 950);
      i++;
    };
    passo();
  }
})();
