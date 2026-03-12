if (!sessionStorage.getItem('token_cv')) {
  window.location.href = '/login.html';
}

function logout() {
  sessionStorage.removeItem('token_cv');
  localStorage.removeItem('vendedor_cv');
  window.location.href = '/login.html';
}

async function enviarVenda(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.textContent = 'Enviando...';
  btn.disabled = true;

  const payload = {
    cliente: document.getElementById('vendaCliente').value,
    campanha: document.getElementById('vendaCampanha').value,
    canal: document.getElementById('vendaCanal').value,
    valor: parseFloat(document.getElementById('vendaValor').value)
  };

  try {
    const res = await fetch('/api/vendas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token_cv')}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Erro ao salvar venda');
    }

    document.getElementById('formVenda').reset();
    document.getElementById('modalVenda').style.display = 'none';
  } catch (err) {
    alert('Erro: ' + err.message);
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

window.logout = logout;
window.enviarVenda = enviarVenda;

/* ================================================================
   CENTRAL DE VENDAS — WebSocket Client
   ================================================================ */

const WS_URL = `ws://${location.host}`;

/* ── RELÓGIO ── */
function updateClock() {
  document.getElementById('clock').textContent =
    new Date().toLocaleTimeString('pt-BR');
}
setInterval(updateClock, 1000);
updateClock();

/* ================================================================
 * WEBSOCKET
 * Conecta ao servidor e reconecta automaticamente se cair.
 * ================================================================ */
let ws = null;

function conectar() {
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    setStatus('connected', 'Conectado');
    addLog('Conexão estabelecida', 'in');

    const token = sessionStorage.getItem('token_cv');
    if (token) {
      ws.send(JSON.stringify({ type: 'auth', token }));
    }
  };

  ws.onclose = () => {
    setStatus('disconnected', 'Desconectado');
    addLog('Conexão encerrada', 'out');
    setTimeout(conectar, 3000);
  };

  ws.onerror = () => {
    addLog('Erro na conexão WebSocket', 'out');
  };

  ws.onmessage = (event) => {
    let msg;
    try { msg = JSON.parse(event.data); }
    catch { return; }

    switch (msg.type) {

      case 'init':
        if (msg.kpis) renderKPIs(msg.kpis);
        if (msg.porHora) renderBarras(msg.porHora);
        if (msg.topClientes) renderTop(msg.topClientes);
        if (msg.vendas) msg.vendas.slice(0, 10).forEach(v => addFeedItem(v, false));
        addLog('Dados iniciais recebidos', 'data');
        break;

      case 'venda':
        if (msg.venda) addFeedItem(msg.venda, true);
        if (msg.kpis) renderKPIs(msg.kpis, true);
        if (msg.topClientes) renderTop(msg.topClientes);
        if (msg.porHora) renderBarras(msg.porHora);
        addLog(`Nova venda: ${msg.venda?.cliente ?? ''}`, 'data');
        break;

      case 'kpis':
        if (msg.kpis) renderKPIs(msg.kpis, true);
        break;

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

function fmt(val) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL',
    minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(val);
}

function fmtNum(val) {
  return new Intl.NumberFormat('pt-BR').format(val);
}

function addLog(msg, tipo) {
  const list = document.getElementById('logList');
  const time = new Date().toLocaleTimeString('pt-BR');
  const el = document.createElement('div');
  el.className = 'log-item';
  el.innerHTML = `<span class="log-time">${time}</span><span class="log-msg ${tipo}">${msg}</span>`;
  list.insertBefore(el, list.firstChild);
  while (list.children.length > 50) list.removeChild(list.lastChild);
}

function flashCard(id) {
  const card = document.getElementById(`card-${id}`);
  if (!card) return;
  card.classList.remove('kpi-flash');
  void card.offsetWidth;
  card.classList.add('kpi-flash');
}

/* ================================================================
   RENDER FUNCTIONS
   ================================================================ */

function renderKPIs(kpis, animate = false) {
  const set = (elId, formatted, deltaId, deltaVal) => {
    const el = document.getElementById(elId);
    if (el) {
      el.textContent = formatted;
      if (animate) flashCard(elId.replace('kpi-', ''));
    }
    const d = document.getElementById(deltaId);
    if (d && deltaVal !== undefined) {
      d.textContent = deltaVal;
      d.className = 'kpi-delta' + (String(deltaVal).startsWith('-') ? ' down' : '');
    }
  };

  set('kpi-faturamento', fmt(kpis.faturamento), 'delta-faturamento', kpis.deltaFaturamento ?? '');
  set('kpi-campanhas', kpis.campanhas, 'delta-campanhas', kpis.deltaCampanhas ?? '');
  set('kpi-vendas-hoje', fmtNum(kpis.vendasHoje), 'delta-vendas-hoje', kpis.deltaVendasHoje ?? '');
  set('kpi-ticket-medio', fmt(kpis.ticketMedio), 'delta-ticket-medio', kpis.deltaTicketMedio ?? '');
}

function renderBarras(porHora) {
  const container = document.getElementById('barChart');
  if (!porHora?.length) return;
  const maxVal = Math.max(...porHora.map(h => h.valor), 1);
  container.innerHTML = '';
  porHora.forEach(h => {
    const pct = Math.round((h.valor / maxVal) * 100);
    const wrap = document.createElement('div');
    wrap.className = 'bar-wrap';
    wrap.innerHTML = `
      <div class="bar" style="height:${pct}%"></div>
      <div class="bar-label">${h.hora}</div>
    `;
    container.appendChild(wrap);
  });
}

function renderTop(clientes) {
  const list = document.getElementById('rankList');
  if (!clientes?.length) return;
  const maxVal = Math.max(...clientes.map(c => c.valor), 1);
  const medalhas = ['🥇', '🥈', '🥉'];
  list.innerHTML = clientes.map((c, i) => `
    <div class="rank-item">
      <span class="rank-num ${i === 0 ? 'gold' : ''}">${medalhas[i] ?? i + 1}</span>
      <div style="display:flex; flex-direction:column; gap:2px;">
        <span class="rank-name">${c.nome}</span>
        <span style="font-size:0.65rem; color:var(--muted);">${c.vendedor_nome ? '👤 ' + c.vendedor_nome : ''}</span>
      </div>
      <div class="rank-bar-wrap" style="margin-left:8px;">
        <div class="rank-bar" style="width:${Math.round((c.valor / maxVal) * 100)}%"></div>
      </div>
      <span class="rank-val">${fmt(c.valor)}</span>
    </div>
  `).join('');
}

const CORES_CANAL = {
  'Instagram': '#833ab4',
  'YouTube': '#ff0000',
  'Google Ads': '#4285f4',
  'TikTok': '#69c9d0',
  'LinkedIn': '#0077b5',
  'TV': '#ff6b35',
  'Rádio': '#ffc107',
  'OOH': '#39ff85',
};

function addFeedItem(venda, animate = true) {
  const feed = document.getElementById('feed');

  const placeholder = feed.querySelector('.placeholder-msg');
  if (placeholder) placeholder.remove();

  const cor = CORES_CANAL[venda.canal] ?? '#6b6b80';
  const item = document.createElement('div');
  item.className = 'feed-item';
  item.style.borderLeft = `3px solid ${cor}`;
  item.innerHTML = `
    <div class="feed-icon" style="background:${cor}22">${venda.emoji ?? '📢'}</div>
    <div class="feed-info">
      <div class="feed-name">${venda.cliente}</div>
      <div class="feed-sub">${venda.campanha} · ${venda.canal} ${venda.vendedor_nome ? ' · 👤 ' + venda.vendedor_nome : ''}</div>
    </div>
    <div class="feed-value">${fmt(venda.valor)}</div>
  `;

  if (animate) feed.insertBefore(item, feed.firstChild);
  else feed.appendChild(item);

  while (feed.children.length > 50) feed.removeChild(feed.lastChild);
}

/* ── INICIA ── */
conectar();
