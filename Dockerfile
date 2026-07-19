# ──────────────────────────────────────────────────────────────────────────────
# PredictXGo admin — Next.js production image (standalone output)
#
# Requires `output: 'standalone'` in next.config.ts (already enabled).
# Produces a minimal runtime image that runs `node server.js` without copying
# node_modules — only the traced dependencies are bundled by Next.
# ──────────────────────────────────────────────────────────────────────────────

ARG NODE_VERSION=20

# ── Stage 1: deps ─────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-slim AS deps
WORKDIR /app

# package-lock.json is committed (npm). pnpm-lock.yaml also exists but npm is
# the canonical lockfile used here for Docker reproducibility.
COPY package.json package-lock.json ./
# --legacy-peer-deps: date-fns@4 vs react-day-picker@8 peer conflict (RDP wants ^2||^3).
# devDeps still install here (this stage has no NODE_ENV=production); needed for build.
RUN npm ci --legacy-peer-deps

# ── Stage 2: builder ──────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars go here if needed (NEXT_PUBLIC_*). Runtime env (DB url,
# API origin) must be supplied at `docker run`, not build time.
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

RUN npm run build

# ── Stage 3: runtime ──────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-slim AS runtime

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3001 \
    HOSTNAME=0.0.0.0

WORKDIR /app

RUN useradd --create-home --uid 1001 nextjs

# Standalone server + static assets. `next build` traces only the deps actually
# used and emits them under .next/standalone/node_modules.
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public

USER nextjs
EXPOSE 3001

CMD ["node", "server.js"]
