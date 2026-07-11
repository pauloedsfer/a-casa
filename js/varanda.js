/* ============================================================
   Varanda — o lado de fora. Área "segura": aqui NÃO chamamos
   Casa.medo (que sobrescreveria a paleta clara) nem o áudio de
   terror. Só a voz, como alguém contando a história da casa.
   ============================================================ */

(() => {
  "use strict";

  const LIVRE = Estado.flag("presenca_livre");   // o mecanismo foi desligado

  // a fotografia do cômodo (artefato achado na casa)
  const FOTO = Foto.montar({
    destino: "#foto", id: "varanda",
    legenda: LIVRE ? "a casa · a vela apagou e o sótão acendeu" : "a casa vista do quintal · 1998",
    velado: "clique para ver a casa daqui de fora",
    revelado: () => true
  });
  FOTO.estagio(LIVRE ? 2 : 0);
  Estado.marcarComodo("varanda");
  Estado.flag("varanda_visitada", true);

  // depois de desligar o mecanismo, a vista muda de verdade
  if (LIVRE) {
    const v1 = document.getElementById("vista-1");
    const v2 = document.getElementById("vista-2");
    if (v1) v1.textContent = "daqui dá pra ver a casa inteira: dois andares de madeira escurecida, e as árvores agora encostam nas paredes. a janela do térreo está escura — a vela apagou. mas lá em cima, no sótão, uma luz âmbar acende e apaga devagar, no ritmo de quem respira.";
    if (v2) v2.textContent = "não há mais vento. a casa parou de ranger. ela está quieta do jeito que as coisas ficam quando finalmente conseguem o que queriam.";
  }

  setTimeout(() => {
    if (LIVRE) {
      // depois de desligar o mecanismo: a casa está diferente vista de fora
      Casa.falar("olhe de novo. a vela do saguão apagou — ela não precisa mais dela.");
      Casa.falar("e a janela do sótão está acesa. você desligou aquilo com as suas próprias mãos.", { pausaFinal: 2600 });
      Casa.falar("as árvores chegaram mais perto desde que você entrou. ninguém planta árvore em uma noite.", { pausaFinal: 2800 });
      Casa.falar("fique aqui fora o quanto quiser. mas não é mais a casa que está trancada — é o lado de fora.", { pausaFinal: 3200 });
    } else {
      Casa.falar("você saiu. respire. daqui a casa parece quase inofensiva.");
      Casa.falar("quase.", { pausaFinal: 2200 });
      if (Estado.totalSelos() > 0) {
        Casa.falar("vejo que você já mexeu nas coisas lá dentro. ela também viu.", { pausaFinal: 2600 });
      }
      Casa.falar("fique o quanto quiser. mas você e eu sabemos como isto termina: você volta pra dentro.");
    }
  }, 600);
})();
