# Central de Vendas — Dashboard em Tempo Real

Dashboard de vendas em tempo real para agência de mídia/publicidade, desenvolvido como atividade prática de comunicação cliente-servidor usando **WebSocket**.

---

## Estrutura de arquivos (frontend)

```
├── index.html   → estrutura da página (HTML semântico)
├── style.css    → toda a estilização visual
├── app.js       → lógica WebSocket e renderização dos dados
└── README.md    → este arquivo
```

> O backend (servidor Node.js) ainda será desenvolvido. Veja a seção **Integração com o Backend** abaixo.

---

## O que o dashboard exibe

### KPI Cards (topo)
Quatro métricas principais atualizadas em tempo real:
- **Faturamento Hoje** — total acumulado em R$
- **Campanhas Ativas** — quantidade de campanhas em veiculação
- **Impressões/hora** — volume de impressões na última hora
- **Conversões** — total de conversões do dia

Cada card pisca com animação ao receber um novo valor do servidor.

### Faturamento por Hora (gráfico de barras)
Barras coloridas mostrando o faturamento acumulado por hora do dia corrente. Atualiza automaticamente a cada nova venda.

### Feed de Vendas em Tempo Real
Lista rolável com as últimas vendas recebidas via WebSocket. Cada item exibe cliente, campanha, canal de mídia e valor. A cor da borda esquerda identifica o canal:

| Canal      | Cor       |
|------------|-----------|
| Instagram  | Roxo      |
| YouTube    | Vermelho  |
| Google Ads | Azul      |
| TikTok     | Ciano     |
| LinkedIn   | Azul escuro |
| TV         | Laranja   |
| Rádio      | Amarelo   |
| OOH        | Verde     |

### Top Clientes
Ranking dos 5 maiores clientes do dia com barra de progresso proporcional ao maior valor.

### Usuários Online (bônus)
Contador de quantos usuários/abas estão com o dashboard aberto simultaneamente. Exige que o backend envie o tipo `"usuarios"` a cada conexão/desconexão.

### Log de Conexão (bônus)
Registro em tempo real dos eventos WebSocket: conexão, desconexão, erros e dados recebidos — com timestamp.

---

## Indicador de Status WebSocket

No cabeçalho há um badge com ponto colorido:
- 🟢 **Verde pulsando** → conectado ao servidor
- 🔴 **Vermelho** → desconectado (tentando reconectar a cada 3 segundos automaticamente)

---

## Integração com o Backend

O arquivo `app.js` se conecta via WebSocket em:
```
ws://localhost:3000
```
Para mudar a porta, edite a constante `WS_URL` no topo de `app.js`.

### Tipos de mensagem esperados do servidor

O servidor deve enviar JSON com o campo `type`. Os tipos suportados são:

#### `"init"` — snapshot inicial
Enviado logo após o cliente conectar. Carrega o estado atual do dashboard.

```json
{
  "type": "init",
  "kpis": {
    "faturamento": 45820,
    "campanhas": 12,
    "impressoes": 980000,
    "conversoes": 342,
    "deltaFaturamento": "+12%",
    "deltaCampanhas": "+2",
    "deltaImpressoes": "+5%",
    "deltaConversoes": "-3"
  },
  "porHora": [
    { "hora": "08h", "valor": 3200 },
    { "hora": "09h", "valor": 5400 }
  ],
  "topClientes": [
    { "nome": "Nike Brasil", "valor": 12500 },
    { "nome": "Itaú", "valor": 9800 }
  ],
  "vendas": [
    { "cliente": "Nike Brasil", "campanha": "Verão 2025", "valor": 4800, "canal": "Instagram", "emoji": "📱" }
  ]
}
```

#### `"venda"` — nova venda (broadcast)
Enviado a todos os clientes conectados a cada nova venda registrada.

```json
{
  "type": "venda",
  "venda": {
    "cliente": "Ambev",
    "campanha": "Copa do Mundo",
    "valor": 7200,
    "canal": "YouTube",
    "emoji": "🎬"
  },
  "kpis": { "...": "atualizado" },
  "topClientes": [],
  "porHora": []
}
```

#### `"kpis"` — atualização periódica
Pode ser enviado a cada 30s para manter os cards sincronizados mesmo sem nova venda.

```json
{
  "type": "kpis",
  "kpis": { "...": "valores atualizados" }
}
```

#### `"usuarios"` — contagem online (bônus)
Enviado quando qualquer cliente conecta ou desconecta.

```json
{
  "type": "usuarios",
  "count": 4
}
```

---

## Como rodar (quando o backend estiver pronto)

```bash
# 1. Instalar dependências do servidor
npm install

# 2. Iniciar o servidor
node server.js

# 3. Abrir o frontend
# Basta abrir index.html no navegador, ou usar live-server:
npx live-server
```

---

## Tecnologias utilizadas

| Camada   | Tecnologia                        |
|----------|-----------------------------------|
| Frontend | HTML5, CSS3, JavaScript (ES6+)    |
| Fonte    | Bebas Neue (KPIs), Syne, DM Mono  |
| Comunicação | WebSocket nativo (`new WebSocket`) |
| Backend* | Node.js + Express + ws            |

*backend a ser implementado

---

## Estratégia de Comunicação: WebSocket

WebSocket foi escolhido por ser a estratégia mais adequada para um dashboard de vendas em tempo real, pois:

- A comunicação é **bidirecional e persistente** — o servidor empurra dados sem esperar requisições
- **Múltiplos usuários** veem as mesmas atualizações instantaneamente via broadcast
- Elimina o overhead de polling repetitivo (sem ficar abrindo e fechando conexões HTTP)
- Ideal para dados que mudam com frequência imprevisível, como novas vendas
