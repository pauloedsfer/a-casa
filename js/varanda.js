/* ============================================================
   Varanda — o lado de fora. Área "segura": aqui NÃO chamamos
   Casa.medo (que sobrescreveria a paleta clara) nem o áudio de
   terror. Só a voz, como alguém contando a história da casa.
   ============================================================ */

(() => {
  "use strict";

  // a fotografia do cômodo (artefato achado na casa)
  const FOTO = Foto.montar({
    destino: "#foto", id: "varanda",
    legenda: "a casa vista da varanda · 1998",
    velado: "clique para ver a casa daqui de fora",
    revelado: () => true
  });
  FOTO.estagio(0);
  Estado.marcarComodo("varanda");
  Estado.flag("varanda_visitada", true);

  setTimeout(() => {
    Casa.falar("você saiu. respire. daqui a casa parece quase inofensiva.");
    Casa.falar("quase.", { pausaFinal: 2200 });
    if (Estado.totalSelos() > 0) {
      Casa.falar("vejo que você já mexeu nas coisas lá dentro. ela também viu.", { pausaFinal: 2600 });
    }
    Casa.falar("fique o quanto quiser. mas você e eu sabemos como isto termina: você volta pra dentro.");
  }, 600);
})();
