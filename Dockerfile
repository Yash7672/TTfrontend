# ---------------------------------------------------------------------------
# FIXORA frontend image — multi-stage
#   Stage 1: build the React production bundle with Node
#   Stage 2: serve the static bundle with Nginx (NO Vite dev server in prod)
# ---------------------------------------------------------------------------

# ------------------------------ build stage --------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first for a cacheable layer.
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

COPY . .
RUN npm run build

# ------------------------------- run stage ----------------------------------
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY public/backend-unavailable.html /usr/share/nginx/html/backend-unavailable.html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
