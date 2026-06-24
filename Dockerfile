FROM cgr.dev/chainguard/node:latest-dev AS builder

# O variante -dev roda como root: necessário para apk e para instalar o pnpm.
USER root
WORKDIR /app

# Toolchain para compilar dependências nativas (bcrypt via node-gyp).
RUN apk add --no-cache build-base python3

# pnpm fixado na versão do lockfile (lockfileVersion 9.0). Não misturar gerenciadores.
RUN npm install -g pnpm@10.33.2

# 1) Dependências primeiro (camada cacheável). O schema é copiado antes do
#    install porque o postinstall do projeto roda `prisma generate`.
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

# 2) Código-fonte e configs de build; compila para dist/.
COPY tsconfig.json tsconfig.build.json nest-cli.json prisma.config.ts ./
COPY src ./src
RUN pnpm build

FROM cgr.dev/chainguard/node:latest AS runtime

WORKDIR /app

ENV NODE_ENV=production

# Apenas o necessário em runtime — código compilado, deps, manifesto e schema
# (o schema + migrations são usados pelo `prisma migrate deploy`).
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/prisma ./prisma

# prisma.config.ts resolve a DATABASE_URL (o datasource no schema não tem `url`);
# necessário para o `prisma migrate deploy` do serviço de migração.
COPY --chown=node:node --from=builder /app/prisma.config.ts ./prisma.config.ts

USER node

# A porta é configurável por PORT (default 8000 no main.ts). Documentação apenas.
EXPOSE 8000

# ENTRYPOINT da imagem chainguard já é `node`. O nest build emite em dist/src/
# (a raiz do tsc inclui prisma/seed.ts), por isso o entrypoint é dist/src/main.js.
CMD ["dist/src/main.js"]
