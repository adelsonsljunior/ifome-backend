# IFome — Backend

API de gestão do **Restaurante Universitário (RU)** do **IFAL**.

O **IFome** é o sistema que digitaliza o dia a dia do RU: publica os cardápios, permite que os
alunos **confirmem presença** nas refeições (controlando a capacidade por período), dá ao corpo
administrativo o **controle de estoque e movimentações**, gera **alertas** proativos (estoque
crítico, demanda) e **notificações** por usuário, e centraliza tudo em um **painel administrativo**.

Este repositório contém o **backend** — uma API REST em TypeScript com NestJS e Prisma sobre
PostgreSQL. A documentação interativa (Swagger) fica em **`/api/docs`**.

---

## Sumário

- [Tech Stack](#tech-stack)
- [Arquitetura de pastas](#arquitetura-de-pastas)
- [Configuração do ambiente](#configuração-do-ambiente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Comandos e scripts](#comandos-e-scripts)
- [Documentação da API](#documentação-da-api)

---

## Tech Stack

| Camada | Tecnologia |
|---|---|
| Runtime | **Node.js** `^24` |
| Linguagem | **TypeScript** `^5.7` |
| Framework | **NestJS** `11` (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`) |
| Banco de dados | **PostgreSQL** `18` |
| ORM / acesso a dados | **Prisma** `7` (`@prisma/client` + `@prisma/adapter-pg`) |
| Validação | **class-validator** + **class-transformer** (via `ValidationPipe` global) |
| Autenticação | **JWT** (`@nestjs/jwt`, `passport`, `passport-jwt`) + hashing **bcrypt** |
| Documentação | **OpenAPI / Swagger** (`@nestjs/swagger`) |
| Gerenciador de pacotes | **pnpm** |
| Testes | **Jest** (`@nestjs/testing`) |

> **Identificadores:** toda chave primária é **UUID v7 gerada pelo banco** (`uuidv7()` do
> PostgreSQL 18) — a aplicação nunca gera o `id`.

---

## Arquitetura de pastas

O projeto segue uma **arquitetura em camadas (clean/hexagonal)**: um módulo por domínio, com as
dependências sempre apontando **para dentro**, em direção ao núcleo de regra de negócio
(`api → core ← infra`).

```text
ifome-backend/
├── prisma/                      # Fonte da verdade do banco
│   ├── schema.prisma            #   modelos, enums e o trigger de status de estoque
│   ├── migrations/              #   histórico de migrations
│   └── seed.ts                  #   popula usuários iniciais (admin e aluno)
├── src/
│   ├── main.ts                  # Bootstrap: prefixo global /api, ValidationPipe e Swagger
│   ├── app.module.ts            # Módulo raiz — registra os módulos de domínio
│   ├── common/                  # Guards, decorators, pipes, DTOs e helpers compartilhados
│   ├── prisma/                  # PrismaModule + PrismaService (único acesso ao banco)
│   ├── shared/                  # Read-models e exceptions de domínio compartilhados
│   └── modules/
│       ├── auth/                # Autenticação JWT: login/logout, guards, estratégia, bcrypt
│       ├── users/               # Perfil do usuário, restrições alimentares e histórico
│       ├── menu/                # Pratos e cardápios diários; cardápio público (today/week)
│       ├── confirmations/       # Confirmação de presença do aluno nas refeições
│       ├── stock/               # Itens de estoque e movimentações; status de criticidade
│       ├── notifications/       # Notificações por usuário (geração automática + leitura)
│       ├── alerts/              # Alertas administrativos e demanda dos últimos 7 dias
│       └── dashboard/           # Painel administrativo agregado (somente admin)
├── docker-compose.yml           # PostgreSQL 18 local (desenvolvimento)
├── docker-compose.prod.yml      # Stack de produção (api + migrate + seed)
├── Dockerfile
├── prisma.config.ts             # Config do Prisma (schema, migrations e seed via tsx)
└── .env.example                 # Modelo das variáveis de ambiente
```

### Estrutura interna de cada módulo

```text
modules/<feature>/
├── api/        # Entrada HTTP: controller, DTOs (requests/responses) e mappers DTO↔domínio
├── core/       # Núcleo independente de Nest e Prisma (TypeScript puro)
│   ├── domain/       # Entidades (padrão builder) e read-models — a regra de negócio
│   ├── interfaces/   # Portas: primary (use cases) e secondary (repositórios) + tokens de DI
│   └── message/      # Mensagens de erro e constantes do domínio
└── infra/      # Implementação: repositórios Prisma + mappers de persistência
```

**Responsabilidades por módulo:**

| Módulo | Responsabilidade |
|---|---|
| `auth` | Autenticação via JWT, guards (`JwtAuthGuard`, `RolesGuard`), estratégia Passport e hashing bcrypt. |
| `users` | Perfil do usuário, restrições alimentares e histórico de refeições. |
| `menu` | Catálogo de pratos e cardápios (refeições) diários; consulta pública `today`/`week`. |
| `confirmations` | Confirmação de presença do aluno (1 por período/dia), capacidade e listagem admin. |
| `stock` | Itens de estoque e movimentações (entrada/saída); status `ok`/`low`/`crit`. |
| `notifications` | Geração automática de notificações por usuário e marcação de leitura. |
| `alerts` | Alertas administrativos (estoque crítico, demanda) e demanda dos últimos 7 dias. |
| `dashboard` | Painel agregado para o gestor, reunindo dados dos demais módulos. |

---

## Configuração do ambiente

### Pré-requisitos

- **Node.js** `^24` e **pnpm** (`npm install -g pnpm`)
- **Docker** + **Docker Compose** (para subir o PostgreSQL local)

### Passo a passo

```bash
# 1. Clonar o repositório
git clone <url-do-repositorio> ifome-backend
cd ifome-backend

# 2. Mapear as variáveis de ambiente a partir do modelo
cp .env.example .env
#    → edite o .env e troque ao menos o JWT_SECRET (ver tabela abaixo)

# 3. Instalar as dependências (gera o Prisma Client automaticamente no postinstall)
pnpm install

# 4. Subir o banco de dados local (PostgreSQL 18 via Docker)
pnpm db:up

# 5. Aplicar as migrations no banco
pnpm db:migrate

# 6. Popular o banco com os usuários iniciais (admin e aluno)
pnpm db:seed

# 7. Iniciar a aplicação em modo de desenvolvimento (watch)
pnpm start:dev
```

Com a aplicação no ar, a API responde em **`http://localhost:8000/api`** e a documentação
Swagger fica em **`http://localhost:8000/api/docs`** (a porta segue a variável `PORT`).

---

## Variáveis de ambiente

Definidas em `.env` (copie de `.env.example`). **Nunca** comite o `.env`.

| Variável | Descrição | Exemplo |
|---|---|---|
| `POSTGRES_USER` | Usuário do PostgreSQL (usado pelo `docker-compose.yml`). | `ifome` |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL. | `ifome` |
| `POSTGRES_DB` | Nome do banco. | `ifome` |
| `POSTGRES_PORT` | Porta exposta pelo container do Postgres. | `5432` |
| `DATABASE_URL` | String de conexão usada pelo Prisma. | `postgresql://ifome:ifome@localhost:5432/ifome?schema=public` |
| `JWT_SECRET` | Segredo de assinatura do token JWT — **troque em produção**. | `troque-este-segredo-em-producao` |
| `PORT` | Porta HTTP da aplicação. | `8000` |

---

## Comandos e scripts

Use sempre **pnpm**.

### Ciclo de vida da aplicação

| Comando | Descrição |
|---|---|
| `pnpm install` | Instala as dependências (roda `prisma generate` no `postinstall`). |
| `pnpm start:dev` | Inicia em modo desenvolvimento com **watch** (recarrega ao salvar). |
| `pnpm start:debug` | Inicia em modo desenvolvimento com **debug** e watch. |
| `pnpm start` | Inicia a aplicação (sem watch). |
| `pnpm build` | Compila o projeto para `dist/`. |
| `pnpm start:prod` | Executa a build de produção (`node dist/src/main`). |

### Banco de dados (Prisma + Docker)

| Comando | Descrição |
|---|---|
| `pnpm db:up` | Sobe o PostgreSQL local via Docker Compose. |
| `pnpm db:down` | Derruba o banco e **remove o volume** (apaga os dados). |
| `pnpm db:migrate` | Aplica/gera migrations em desenvolvimento (`prisma migrate dev`). |
| `pnpm db:generate` | Regera o Prisma Client a partir do schema. |
| `pnpm db:seed` | Popula o banco com os usuários iniciais (idempotente). |
| `pnpm db:studio` | Abre o **Prisma Studio** (GUI do banco). |

### Qualidade

| Comando | Descrição |
|---|---|
| `pnpm lint` | Roda o ESLint com `--fix`. |
| `pnpm format` | Formata o código com o Prettier. |
| `pnpm test` | Testes unitários (Jest). |
| `pnpm test:watch` | Testes unitários em watch. |
| `pnpm test:cov` | Testes com cobertura. |
| `pnpm test:e2e` | Testes end-to-end. |

> **Dica:** rode `pnpm lint` antes de considerar uma mudança concluída.

---

## Documentação da API

Todas as rotas ficam sob o prefixo global **`/api`** (ex.: `POST /api/auth/login`). Toda entrada
externa é validada por DTOs (`class-validator`) através do `ValidationPipe` global.

A especificação **OpenAPI (Swagger UI)** é gerada automaticamente e fica disponível, com a
aplicação no ar, em:

```text
http://localhost:8000/api/docs
```

As rotas protegidas usam **Bearer JWT** — autentique-se em `POST /api/auth/login` e use o token
retornado no botão **Authorize** do Swagger.
