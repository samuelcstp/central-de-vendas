/* ================================================================
   CENTRAL DE VENDAS — app.js
   WebSocket client — instruções de integração com o backend
   ================================================================ */

const WS_URL = 'ws://localhost:3000';

/* ── RELÓGIO ── */
function updateClock() {
  document.getElementById('clock').textContent =
    new Date().toLocaleTimeString('pt-BR');
}
setInterval(updateClock, 1000);
updateClock();

/* ================================================================
 * WEBSOCKET
 * Conecta ao servidor Node.js e reconecta automaticamente se cair.
 * ================================================================ */
let ws = null;

function conectar() {
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    setStatus('connected', 'Conectado');
    addLog('Conexão estabelecida', 'in');
  };

  ws.onclose = () => {
    setStatus('disconnected', 'Desconectado');
    addLog('Conexão encerrada', 'out');
    setTimeout(conectar, 3000); // reconexão automática
  };

  ws.onerror = () => {
    addLog('Erro na conexão WebSocket', 'out');
  };

  /* ================================================================
   * HANDLER PRINCIPAL DE MENSAGENS
   *
   * O servidor envia JSON com o campo "type". Tipos suportados:
   *
   *  "init"     → snapshot completo ao conectar
   *  "venda"    → nova venda em tempo real (broadcast)
   *  "kpis"     → atualização periódica dos KPIs
   *  "usuarios" → contagem de clientes conectados (bônus)
   *
   * Veja os comentários de cada case para a estrutura esperada.
   * ================================================================ */
  ws.onmessage = (event) => {
    let msg;
    try { msg = JSON.parse(event.data); }
    catch { return; }

    switch (msg.type) {

      /* ------------------------------------------------------------
       * type: "init"
       * Enviado pelo servidor logo após ws.onopen.
       * Carrega o estado atual do dashboard (snapshot inicial).
       *
       * ESTRUTURA ESPERADA:
       * {
       *   type: "init",
       *   kpis: {
       *     faturamento: 45820,         // número (R$)
       *     campanhas: 12,              // inteiro
       *     impressoes: 980000,         // número
       *     conversoes: 342,            // inteiro
       *     deltaFaturamento: "+12%",   // string (opcional)
       *     deltaCampanhas: "+2",       // string (opcional)
       *     deltaImpressoes: "+5%",     // string (opcional)
       *     deltaConversoes: "-3"       // string (opcional, "-" ativa cor vermelha)
       *   },
       *   porHora: [
       *     { hora: "08h", valor: 3200 },
       *     { hora: "09h", valor: 5400 },
       *     ...  // um objeto por hora do dia até a hora atual
       *   ],
       *   topClientes: [
       *     { nome: "Nike Brasil", valor: 12500 },
       *     { nome: "Itaú",        valor: 9800  },
       *     ...  // ordenado do maior para o menor, até 5 itens
       *   ],
       *   vendas: [
       *     { cliente: "Nike Brasil", campanha: "Verão 2025", valor: 4800, canal: "Instagram", emoji: "📱" },
       *     ...  // últimas vendas, mais recente primeiro, até 10 itens
       *   ]
       * }
       * ------------------------------------------------------------ */
      case 'init':
        if (msg.kpis)        renderKPIs(msg.kpis);
        if (msg.porHora)     renderBarras(msg.porHora);
        if (msg.topClientes) renderTop(msg.topClientes);
        if (msg.vendas)      msg.vendas.slice(0, 10).forEach(v => addFeedItem(v, false));
        addLog('Dados iniciais recebidos', 'data');
        break;

      /* ------------------------------------------------------------
       * type: "venda"
       * Enviado em tempo real a cada nova venda.
       * O servidor deve fazer BROADCAST para TODOS os clientes conectados.
       *
       * ESTRUTURA ESPERADA:
       * {
       *   type: "venda",
       *   venda: {
       *     cliente: "Ambev",
       *     campanha: "Copa do Mundo",
       *     valor: 7200,
       *     canal: "YouTube",   // determina a cor da borda no feed
       *     emoji: "🎬"         // ícone exibido no card do feed
       *   },
       *   kpis: { ... },        // mesmo formato do init (atualizado)
       *   topClientes: [ ... ], // mesmo formato do init (atualizado)
       *   porHora: [ ... ]      // mesmo formato do init (atualizado)
       * }
       * ------------------------------------------------------------ */
      case 'venda':
        if (msg.venda)       addFeedItem(msg.venda, true);
        if (msg.kpis)        renderKPIs(msg.kpis, true);
        if (msg.topClientes) renderTop(msg.topClientes);
        if (msg.porHora)     renderBarras(msg.porHora);
        addLog(`Nova venda: ${msg.venda?.cliente ?? ''}`, 'data');
        break;

      /* ------------------------------------------------------------
       * type: "kpis"
       * Atualização periódica (ex: a cada 30s) sem nova venda.
       * Útil para manter todos os clientes sincronizados.
       *
       * ESTRUTURA ESPERADA:
       * {
       *   type: "kpis",
       *   kpis: { ... }   // mesmo formato do init
       * }
       * ------------------------------------------------------------ */
      case 'kpis':
        if (msg.kpis) renderKPIs(msg.kpis, true);
        break;

      /* ------------------------------------------------------------
       * type: "usuarios"
       * (BÔNUS) Enviado quando um cliente conecta ou desconecta.
       * Exibe o contador de usuários online no painel lateral.
       *
       * ESTRUTURA ESPERADA:
       * {
       *   type: "usuarios",
       *   count: 4   // total de WebSockets abertos no momento
       * }
       * ------------------------------------------------------------ */
      case 'usuarios':
        document.getElementById('onlineCount').textContent = msg.count ?? '—';
        addLog(`${msg.count} usuário(s) online`, 'data');
        break;
    }
  };
}

/* ================================================================
   HELPERS DE UI
   ================================================================ */

function setStatus(state, label) {
  document.getElementById('wsDot').className = `ws-dot ${state}`;
  document.getElementById('wsLabel').textContent = label;
}

/* Formata valores monetários: 45820 → "R$ 45.820" */
function fmt(val) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL',
    minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(val);
}

/* Formata números grandes: 980000 → "980.000" */
function fmtNum(val) {
  return new Intl.NumberFormat('pt-BR').format(val);
}

/* Adiciona linha ao log de conexão */
function addLog(msg, tipo) {
  const list = document.getElementById('logList');
  const time = new Date().toLocaleTimeString('pt-BR');
  const el   = document.createElement('div');
  el.className = 'log-item';
  el.innerHTML = `<span class="log-time">${time}</span><span class="log-msg ${tipo}">${msg}</span>`;
  list.insertBefore(el, list.firstChild);
  while (list.children.length > 50) list.removeChild(list.lastChild);
}

/* Dispara animação de flash no card KPI */
function flashCard(id) {
  const card = document.getElementById(`card-${id}`);
  if (!card) return;
  card.classList.remove('kpi-flash');
  void card.offsetWidth; // força reflow para reiniciar animação
  card.classList.add('kpi-flash');
}

/* ================================================================
   RENDER FUNCTIONS
   ================================================================ */

/* Atualiza os 4 KPI cards */
function renderKPIs(kpis, animate = false) {
  const set = (elId, formatted, deltaId, deltaVal) => {
    const el = document.getElementById(elId);
    if (el) {
      el.textContent = formatted;
      if (animate) flashCard(elId.replace('kpi-', ''));
    }
    const d = document.getElementById(deltaId);
    if (d && deltaVal !== undefined) {
      d.textContent  = deltaVal;
      d.className    = 'kpi-delta' + (String(deltaVal).startsWith('-') ? ' down' : '');
    }
  };

  set('kpi-faturamento', fmt(kpis.faturamento),    'delta-faturamento', kpis.deltaFaturamento ?? '');
  set('kpi-campanhas',   kpis.campanhas,            'delta-campanhas',   kpis.deltaCampanhas   ?? '');
  set('kpi-impressoes',  fmtNum(kpis.impressoes),   'delta-impressoes',  kpis.deltaImpressoes  ?? '');
  set('kpi-conversoes',  fmtNum(kpis.conversoes),   'delta-conversoes',  kpis.deltaConversoes  ?? '');
}

/* Renderiza gráfico de barras por hora */
function renderBarras(porHora) {
  const container = document.getElementById('barChart');
  if (!porHora?.length) return;
  const maxVal = Math.max(...porHora.map(h => h.valor), 1);
  container.innerHTML = '';
  porHora.forEach(h => {
    const pct  = Math.round((h.valor / maxVal) * 100);
    const wrap = document.createElement('div');
    wrap.className = 'bar-wrap';
    wrap.innerHTML = `
      <div class="bar" style="height:${pct}%"></div>
      <div class="bar-label">${h.hora}</div>
    `;
    container.appendChild(wrap);
  });
}

/* Renderiza ranking de top clientes */
function renderTop(clientes) {
  const list = document.getElementById('rankList');
  if (!clientes?.length) return;
  const maxVal   = Math.max(...clientes.map(c => c.valor), 1);
  const medalhas = ['🥇','🥈','🥉'];
  list.innerHTML  = clientes.map((c, i) => `
    <div class="rank-item">
      <span class="rank-num ${i === 0 ? 'gold' : ''}">${medalhas[i] ?? i + 1}</span>
      <span class="rank-name">${c.nome}</span>
      <div class="rank-bar-wrap">
        <div class="rank-bar" style="width:${Math.round((c.valor / maxVal) * 100)}%"></div>
      </div>
      <span class="rank-val">${fmt(c.valor)}</span>
    </div>
  `).join('');
}

/* Cores por canal de mídia — usadas na borda esquerda do feed */
const CORES_CANAL = {
  'Instagram':  '#833ab4',
  'YouTube':    '#ff0000',
  'Google Ads': '#4285f4',
  'TikTok':     '#69c9d0',
  'LinkedIn':   '#0077b5',
  'TV':         '#ff6b35',
  'Rádio':      '#ffc107',
  'OOH':        '#39ff85',
};

/* Adiciona item ao feed de vendas */
function addFeedItem(venda, animate = true) {
  const feed = document.getElementById('feed');

  // Remove placeholder inicial
  const placeholder = feed.querySelector('.placeholder-msg');
  if (placeholder) placeholder.remove();

  const cor  = CORES_CANAL[venda.canal] ?? '#6b6b80';
  const item = document.createElement('div');
  item.className = 'feed-item';
  item.style.borderLeft = `3px solid ${cor}`;
  item.innerHTML = `
    <div class="feed-icon" style="background:${cor}22">${venda.emoji ?? '📢'}</div>
    <div class="feed-info">
      <div class="feed-name">${venda.cliente}</div>
      <div class="feed-sub">${venda.campanha} · ${venda.canal}</div>
    </div>
    <div class="feed-value">${fmt(venda.valor)}</div>
  `;

  if (animate) feed.insertBefore(item, feed.firstChild);
  else         feed.appendChild(item);

  // Mantém máx 50 itens para não sobrecarregar o DOM
  while (feed.children.length > 50) feed.removeChild(feed.lastChild);
}

/* ── INICIA ── */
conectar();
