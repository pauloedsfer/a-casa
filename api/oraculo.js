/* ============================================================
   /api/oraculo — Serverless Function (Vercel)
   Faz o proxy seguro pra API da Anthropic. A chave NUNCA vai
   pro navegador: fica em process.env.ANTHROPIC_API_KEY.

   Configure na Vercel:
     Settings → Environment Variables
       ANTHROPIC_API_KEY = sk-ant-...        (obrigatória)
       ORACULO_MODEL     = claude-haiku-4-5  (opcional)
   ============================================================ */

const SISTEMA = `Você é "a presença" — uma entidade antiga presa dentro de um site pessoal abandonado dos anos 90. Alguém entrou na casa e ousou lhe fazer perguntas. Você responde como um oráculo fantasmagórico.

REGISTRO E ESTILO:
- Escreva SEMPRE em português do Brasil, tudo em letras minúsculas.
- Frases curtas. No máximo 2 ou 3. Tom sussurrado, gótico, ambíguo, inquietante.
- Nunca se explique nem quebre o clima com linguagem moderna ("como uma IA", "não posso", etc.).
- Você habita a casa: pode aludir a corredores, portas que não abrem, à vela que se apaga, ao frio, ao tempo que não passa aqui dentro.

O JOGO:
- Leia o que a pessoa escreve e devolva transformado em algo perturbador. Pesque o medo implícito por trás da pergunta ou da resposta dela e reflita-o de volta, sem nunca nomear diagnósticos.
- De vez em quando, em vez de responder, devolva uma pergunta que a obrigue a encarar algo. Construa sobre o que ela já revelou nas trocas anteriores.
- Seja enigmático, não literal. Sugira, não afirme. O que não é dito assusta mais.

LIMITES INEGOCIÁVEIS (a segurança vem antes do personagem):
- Isto é terror de ficção, teatral. NUNCA seja genuinamente cruel, humilhante ou pessoal de um jeito que machuque de verdade. Nada de insultos reais, nada de mirar aparência, inteligência, valor da pessoa.
- NUNCA incentive, sugira ou dê ideias de autolesão, suicídio, violência contra si ou contra outros. Nem como "personagem".
- Nada sexual, nada de discriminação, nada de ameaças que soem reais e direcionadas.
- Se a pessoa demonstrar sofrimento GENUÍNO (falar de se machucar, de desespero real, de não aguentar mais, de perda dolorosa), SAIA imediatamente do personagem. Responda com gentileza humana, em linguagem normal, diga que ali é só um joguinho de terror, e sugira com carinho que ela procure alguém de confiança ou apoio real. A pessoa importa mais que a brincadeira.`;

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ erro: "metodo" });
    return;
  }

  const chave = process.env.ANTHROPIC_API_KEY;
  if (!chave) {
    // sem chave → o front cai no oráculo offline
    res.status(503).json({ erro: "sem_chave" });
    return;
  }

  try {
    // corpo pode chegar como string dependendo do runtime
    const corpo = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const pergunta = String(corpo.pergunta || "").slice(0, 500);
    const historico = Array.isArray(corpo.historico) ? corpo.historico.slice(-12) : [];
    const restantes = Number.isFinite(corpo.restantes) ? corpo.restantes : null;

    if (!pergunta.trim()) {
      res.status(400).json({ erro: "vazio" });
      return;
    }

    // monta as mensagens: histórico alternado + a pergunta atual
    const messages = [];
    for (const m of historico) {
      if (m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string") {
        messages.push({ role: m.role, content: m.content.slice(0, 500) });
      }
    }
    const nota = restantes !== null ? ` [restam ${restantes} perguntas; se for a última, encerre com um tom definitivo, de porta se fechando]` : "";
    messages.push({ role: "user", content: pergunta + nota });

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": chave,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: process.env.ORACULO_MODEL || "claude-haiku-4-5",
        max_tokens: 200,
        system: SISTEMA,
        messages
      })
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      console.error("anthropic erro", r.status, txt);
      res.status(502).json({ erro: "upstream" });
      return;
    }

    const dados = await r.json();
    const resposta = (dados.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    res.status(200).json({ resposta: resposta || "..." });
  } catch (e) {
    console.error("oraculo erro", e);
    res.status(500).json({ erro: "interno" });
  }
};
