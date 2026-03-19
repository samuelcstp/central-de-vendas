# Central de Vendas — Dashboard em Tempo Real

## Visão geral
Este projeto entrega um dashboard de vendas em tempo real para uma agência de mídia/publicidade. A interface apresenta KPIs, gráfico por hora, ranking de clientes, feed de vendas instantâneo e status de conexão. O backend é Node.js com SQLite e comunicação em tempo real via WebSocket.

## Objetivos e escopo
- Oferecer uma visão operacional das vendas em tempo real.
- Permitir autenticação de vendedores e registro de novas vendas.
- Atualizar métricas globais automaticamente ao receber novas vendas.
- Manter o frontend simples, estático e leve.

## Arquitetura
- Backend: Node.js + Express (API REST) + SQLite (persistência).
- Tempo real: WebSocket para envio de eventos e sincronização do dashboard.
- Frontend: HTML/CSS/JS estático servido pelo próprio Express.

## Módulos e funcionalidades

### `server.js`
Ponto de entrada da aplicação. Inicializa o Express, cria o servidor HTTP, conecta o servidor WebSocket e injeta o `WsHandler` na aplicação para emitir eventos a partir das rotas.

### Rotas (`app/routes`)
- `authRoutes.js`: expõe `POST /api/auth/register` e `POST /api/auth/login`.
- `vendaRoutes.js`: expõe `POST /api/vendas` com autenticação JWT.
- `routes.js`: registra rotas de API e serve arquivos estáticos do frontend.

### Controllers (`app/controllers`)
- `authController.js`: registra e autentica vendedores, gerando JWT.
- `vendaController.js`: processa vendas, persiste no banco, atualiza KPIs e dados por hora.
- `kpiController.js`: calcula e fornece KPIs agregados.

### Repositories (`app/repositories`)
- `vendedorRepository.js`: CRUD de vendedores e hash de senha.
- `vendaRepository.js`: persistência de vendas, consultas de recentes e top clientes.
- `kpiRepository.js`: leitura e atualização das métricas globais.
- `dadosPorHoraRepository.js`: soma faturamento por hora do dia.

### Models (`app/models`)
- `Vendedor`, `Venda`, `KPI`, `DadosPorHora` padronizam a estrutura dos dados e conversões para JSON.

### Middleware (`app/middlewares`)
- `authMiddleware.js`: valida JWT e adiciona o vendedor autenticado ao request.

### Utils (`app/utils`)
- `WsHandler`: gerencia conexões WebSocket, autenticação via token, broadcast e envio de dados iniciais.
- `Notificador`: logger simples para eventos de venda.

### Banco de dados (`app/database/db.js`)
- Cria e inicializa as tabelas `vendedores`, `vendas`, `kpis`, `dados_por_hora`.
- Garante o seed do registro único de KPIs.
- Armazena o SQLite em `data/data.db`.

## Fluxos principais
- Login/Register: gera JWT para uso nas requisições protegidas.
- Registro de venda: API `POST /api/vendas` recebe venda autenticada, persiste no SQLite, atualiza KPIs/dados por hora e emite evento via WebSocket.
- Dashboard: ao conectar no WebSocket, o cliente recebe KPIs, dados por hora, top clientes e últimas vendas.

## Autenticação e sessão
- JWT assinado no backend.
- Expiração: `30m`.
- O token é guardado no `sessionStorage`, a sessão termina ao fechar o navegador.

## Frontend
- `view/index.html`: dashboard principal.
- `view/login.html`: tela de login.
- `view/index.js`: consumo da API e WebSocket, renderização de KPIs e listas.
- `view/login.js`: autenticação e armazenamento do token.
- `view/style.css`: estilos do dashboard.

## Como executar

1. Instalar dependências:
```bash
npm install
```

2. Iniciar o servidor:
```bash
npm start
```

3. Acessar no navegador:
```
http://localhost:3000
```
