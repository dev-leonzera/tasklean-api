# TaskLean API

API REST para a plataforma TaskLean, construída com Express, TypeORM e SQLite, utilizando TypeScript.

## 🚀 Tecnologias

- **Express.js** - Framework web para Node.js
- **TypeORM** - ORM para TypeScript e JavaScript
- **TypeScript** - Superset do JavaScript com tipagem estática
- **SQLite** - Banco de dados relacional
- **tsx** - Executor TypeScript com watch mode nativo

## 📋 Pré-requisitos

- Node.js (v18 ou superior)
- npm ou yarn

## 🔧 Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

3. O banco de dados será criado automaticamente na primeira execução (synchronize está habilitado em desenvolvimento).

4. (Opcional) Popule o banco com dados iniciais:
```bash
npm run seed
```

## 🏃 Executando

### Modo desenvolvimento
```bash
npm run dev
```
O servidor será iniciado com watch mode nativo do Node.js (usando tsx), recarregando automaticamente quando houver mudanças.

### Modo produção
```bash
npm run build
npm start
```

O servidor estará rodando em `http://localhost:3000` (ou na porta definida em `PORT`).

## 📚 Endpoints da API

### Health Check
- `GET /health` - Verifica se a API está funcionando

### Projects
- `GET /api/projects` - Lista todos os projetos
- `GET /api/projects/:id` - Busca um projeto por ID
- `POST /api/projects` - Cria um novo projeto
- `PATCH /api/projects/:id` - Atualiza um projeto
- `DELETE /api/projects/:id` - Deleta um projeto
- `POST /api/projects/:id/members` - Adiciona membro ao projeto
- `DELETE /api/projects/:id/members/:userId` - Remove membro do projeto

### Tasks
- `GET /api/tasks` - Lista todas as tarefas (suporta query params: projectId, assigneeId, status, priority)
- `GET /api/tasks/:id` - Busca uma tarefa por ID
- `POST /api/tasks` - Cria uma nova tarefa
- `PATCH /api/tasks/:id` - Atualiza uma tarefa
- `DELETE /api/tasks/:id` - Deleta uma tarefa

### Sprints
- `GET /api/sprints` - Lista todos os sprints (suporta query params: projectId, status)
- `GET /api/sprints/:id` - Busca um sprint por ID
- `POST /api/sprints` - Cria um novo sprint
- `PATCH /api/sprints/:id` - Atualiza um sprint
- `DELETE /api/sprints/:id` - Deleta um sprint
- `POST /api/sprints/:id/members` - Adiciona membro ao sprint
- `DELETE /api/sprints/:id/members/:userId` - Remove membro do sprint

### Commitments
- `GET /api/commitments` - Lista todos os compromissos (suporta query params: projectId, status, priority, date)
- `GET /api/commitments/:id` - Busca um compromisso por ID
- `POST /api/commitments` - Cria um novo compromisso
- `PATCH /api/commitments/:id` - Atualiza um compromisso
- `DELETE /api/commitments/:id` - Deleta um compromisso
- `POST /api/commitments/:id/participants` - Adiciona participante ao compromisso
- `DELETE /api/commitments/:id/participants/:userId` - Remove participante do compromisso

### Users
- `GET /api/users` - Lista todos os usuários
- `GET /api/users/:id` - Busca um usuário por ID
- `POST /api/users` - Cria um novo usuário
- `PATCH /api/users/:id` - Atualiza um usuário
- `DELETE /api/users/:id` - Deleta um usuário

## 🏗️ Arquitetura

A API segue uma arquitetura em camadas:

```
src/
├── config/          # Configurações (banco de dados, etc)
├── controllers/     # Controladores (lidam com requisições HTTP)
├── services/        # Serviços (lógica de negócio)
├── entities/        # Entidades TypeORM (modelos do banco)
├── routes/          # Definição de rotas
├── types/           # Tipos TypeScript (DTOs, interfaces)
├── database/        # Scripts de seed e migrações
└── server.ts        # Arquivo principal do servidor
```

## 🗄️ Banco de Dados

### TypeORM
O TypeORM está configurado para usar SQLite com `synchronize: true` em desenvolvimento (cria/atualiza tabelas automaticamente).

### Seed
Para popular o banco com dados iniciais:
```bash
npm run seed
```

### Migrações
Para criar migrações (quando necessário):
```bash
npm run migration:generate -- -n NomeDaMigracao
npm run migration:run
```

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo desenvolvimento com watch mode (tsx watch)
- `npm run build` - Compila o TypeScript para JavaScript
- `npm start` - Inicia o servidor em modo produção
- `npm run seed` - Popula o banco de dados com dados iniciais
- `npm run migration:generate` - Gera uma nova migração
- `npm run migration:run` - Executa migrações pendentes
- `npm run migration:revert` - Reverte a última migração

## 🔒 Segurança

⚠️ **Nota**: Esta é uma versão inicial da API. Em produção, considere implementar:
- Autenticação e autorização (JWT, OAuth, etc.)
- Hash de senhas (bcrypt)
- Validação de dados (class-validator, Zod, etc.)
- Rate limiting
- HTTPS
- CORS configurado adequadamente
- Desabilitar `synchronize` em produção e usar migrações

## 📄 Licença

ISC
