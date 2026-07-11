/* ============================================================
   Quarto das crianças — a visão infantil do que aconteceu.
   Risadas sintetizadas (Web Audio) que começam alegres e se
   distorcem em algo sinistro conforme você descobre os nomes.
   Brinquedos que se mexem quando você desvia o olhar. Puro lore:
   sem selo, sem porão — fecha o gancho da lavanderia.
   ============================================================ */

(() => {
  "use strict";

  // a fotografia do cômodo (artefato achado na casa)
  const FOTO = Foto.montar({
    destino: "#foto", id: "criancas",
    legenda: "quarto das crianças · três camas",
    velado: "clique para ver o quarto onde você está",
    revelado: () => Estado.visitou("criancas")
  });
  FOTO.estagio(Estado.flag("lore_criancas") ? 2 : 0);
  const $ = (s) => document.querySelector(s);

  let revelados = 0;
  let loop = null;

  Comodo.iniciar({
    id: "criancas", som: false, selos: false, audio: true, medo: 0.35, aplicarMedo: false,
    intro: "o quarto das crianças. os brinquedos param de se mexer no instante em que você olha.",
    introRevisita: "você voltou. elas gostam quando você volta.",
    jaFez: () => Estado.flag("lore_criancas"),
    aoEntrar: iniciarRisadas
  });

  // ---- risada sintetizada: d de 0 (feliz) a 1 (sinistra) ----
  function risada(d) {
    const ac = Casa.audio.ctx, master = Casa.audio.master;
    if (!ac || !master) return;
    const base = 720 - d * 540;                 // agudo/alegre → grave/sinistro
    const passo = 0.09 + d * 0.15;              // acelerado → arrastado
    const notas = [0, 4, 7, 4, 0];
    let t = ac.currentTime + 0.02;
    notas.forEach((n) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = d > 0.5 ? "sawtooth" : "triangle";
      const freq = base * Math.pow(2, n / 12) * (1 + (Math.random() - 0.5) * d * 0.35);
      o.frequency.setValueAtTime(freq, t);
      if (d > 0.4) o.frequency.exponentialRampToValueAtTime(Math.max(60, freq * 0.65), t + passo * 0.9);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.11 * (1 - d * 0.25), t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + passo * 0.85);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + passo);
      t += passo;
    });
  }

  function iniciarRisadas() {
    if (loop) return;
    const tocar = () => {
      risada(Math.min(1, revelados / 3));
      loop = setTimeout(tocar, 3200 + Math.random() * 1600);
    };
    tocar();
  }

  // ---- os três: nome mal gravado + a fala infantil (eufemística) ----
  const criancas = {
    cavalo: { nome: "bá", fala: "o cavalo da bá. ela dizia que ia cavalgar até o céu. a mamãe disse que podia — mas só uma vez." },
    urso:   { nome: "tetê", fala: "o urso do tetê. ele nunca dormia sem ele. agora o tetê dorme sempre, então o urso pode descansar." },
    blocos: { nome: "joão", fala: "os blocos do joão. ele tava construindo uma casa dentro da casa, pra gente morar quando parasse de doer." }
  };

  function revelar(id) {
    const btn = $("#" + id);
    if (btn.classList.contains("revelado")) { moverOutros(id); return; }
    btn.classList.add("revelado");
    $("#et-" + id).textContent = criancas[id].nome;
    Casa.audio.iniciar();

    $("#caixa-sussurros").hidden = false;
    const s = document.createElement("div");
    s.className = "sussurro";
    s.innerHTML = `<b>${criancas[id].nome}:</b> ${criancas[id].fala}`;
    $("#sussurros").appendChild(s);
    s.scrollIntoView({ behavior: "smooth", block: "nearest" });

    revelados++;
    moverOutros(id);
    risada(Math.min(1, revelados / 3));         // uma risadinha imediata, já mais torta
    if (revelados >= 3) setTimeout(revelacaoFinal, 1400);
  }

  // coisas que se movem sozinhas
  function moverOutros(exceto) {
    document.querySelectorAll(".brinquedo").forEach((b) => {
      if (b.id === exceto) return;
      const dx = (Math.random() - 0.5) * 34, dy = (Math.random() - 0.5) * 18, rot = (Math.random() - 0.5) * 14;
      b.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
      setTimeout(() => { b.style.transform = ""; }, 1100);
    });
  }
  document.addEventListener("visibilitychange", () => { if (!document.hidden) moverOutros(""); });

  function revelacaoFinal() {
    Estado.flag("lore_criancas", true);
    FOTO.estagio(2);
    const fim = document.createElement("div");
    fim.className = "sussurro";
    fim.style.borderTop = "1px solid rgba(217,138,176,.4)";
    fim.style.marginTop = "8px";
    fim.style.paddingTop = "12px";
    fim.innerHTML = "bá, tetê, joão. três nomes riscados por dentro da porta. a versão de vocês é mais doce que a verdade — mas os desenhos na parede não mentem, e vocês ainda riem quando ninguém escuta.";
    $("#sussurros").appendChild(fim);
    Casa.falar("agora você conhece os nomes. eles não vão te deixar esquecer.", { vermelho: true, pausaFinal: 4000 });
  }

  $("#cavalo").addEventListener("click", (e) => { e.stopPropagation(); revelar("cavalo"); });
  $("#urso").addEventListener("click", (e) => { e.stopPropagation(); revelar("urso"); });
  $("#blocos").addEventListener("click", (e) => { e.stopPropagation(); revelar("blocos"); });
})();
