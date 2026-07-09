/* ============================================================
   Estado — o "save" da casa, persistido em localStorage.
   Compartilhado por todos os cômodos. Fonte única de progresso:
   selos coletados, cômodos visitados, nome, visitas e flags.
   ============================================================ */

window.Estado = (() => {
  "use strict";
  const CHAVE = "acasa_v1";
  const TOTAL_SELOS = 4;                       // sala, quarto, cozinha, corredor
  const padrao = () => ({ selos: [], comodos: [], visitas: 0, nome: "", flags: {} });

  let d;
  try { d = Object.assign(padrao(), JSON.parse(localStorage.getItem(CHAVE) || "{}")); }
  catch { d = padrao(); }

  // migração do formato antigo (casa_nome), pra não perder quem já visitou
  try {
    const antigo = localStorage.getItem("casa_nome");
    if (antigo && !d.nome) d.nome = antigo;
  } catch {}

  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(d)); } catch {} }

  return {
    TOTAL_SELOS,
    get nome() { return d.nome; },
    set nome(n) { d.nome = n; salvar(); },

    get visitas() { return d.visitas; },
    registrarVisita() { d.visitas++; salvar(); return d.visitas; },

    temSelo(id) { return d.selos.includes(id); },
    coletarSelo(id) { if (!d.selos.includes(id)) { d.selos.push(id); salvar(); return true; } return false; },
    selos() { return d.selos.slice(); },
    totalSelos() { return d.selos.length; },

    visitou(c) { return d.comodos.includes(c); },
    marcarComodo(c) { if (!d.comodos.includes(c)) { d.comodos.push(c); salvar(); } },

    flag(k, v) { if (v === undefined) return d.flags[k]; d.flags[k] = v; salvar(); },

    reset() { d = padrao(); salvar(); }
  };
})();
