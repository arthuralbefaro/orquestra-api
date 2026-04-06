# Orquestra API - Backend

Backend da plataforma **Orquestra API**, responsável por autenticação, gerenciamento de projetos, automações, execuções e métricas operacionais.

## Stack
- Laravel 13
- PHP 8.3+
- PostgreSQL
- Laravel Sanctum
- Queue com driver `database`
- Pest / PHPUnit

## Principais responsabilidades
- Cadastro e login de usuários
- Autenticação via token
- CRUD de projetos
- CRUD de automações
- Disparo manual de runs
- Retry de execuções
- Dashboard com métricas operacionais
- Health check da API

## Estrutura
```txt
app/
  Http/
    Controllers/Api/
    Requests/
  Jobs/
  Models/
database/
  migrations/
  seeders/
routes/
  api.php
tests/
  Feature/
```

## 1. Instalar dependências
```bash
composer install
```

## 2. Configurar ambiente
```bash
cp .env.example .env
php artisan key:generate
```

## 3. Configurar banco
Ajuste seu .env com suas credenciais do PostgreSQL.

Exemplo:
```bash
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=orquestra
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

## 4. Rodar migrations e seed
```bash
php artisan migrate
php artisan db:seed
```

## 5. Subir a API
```bash
php artisan serve
```

## 6. Subir o worker
```bash
php artisan queue:work
```

## Rotas principais

GET /api/health
POST /api/register
POST /api/login
POST /api/logout
GET /api/me
GET /api/dashboard/metrics
GET|POST|PUT|DELETE /api/projects
GET|POST|PUT|DELETE /api/automations
GET /api/runs
GET /api/automations/{automation}/runs
POST /api/automations/{automation}/run
POST /api/runs/{run}/retry

## Testes
```bash
php artisan test
```
## Usuário demo
```text
email: arthur@orquestra.dev
senha: 12345678
```

---

## 7. O que ainda é manual

Essas partes não têm “código para colar”:

- colocar **descrição do repositório**
- adicionar **topics**
- colocar **website/demo**
- melhorar **histórico de commits**

Esses pontos continuam importantes porque no GitHub público o repo ainda aparece sem description/topics e com histórico muito curto. :contentReference[oaicite:7]{index=7}

## 8. Ordem certa para aplicar

```bash
# 1) backend
cd backend
php artisan migrate
php artisan db:seed
php artisan test

# 2) frontend
cd ../frontend
npm install
npm run lint
npm run build
npm run dev