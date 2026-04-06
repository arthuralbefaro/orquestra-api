# 🚀 Orquestra API

Plataforma de automação backend com execução assíncrona, filas, monitoramento de execuções e métricas operacionais.

Projeto focado em arquitetura backend moderna, observabilidade e boas práticas de desenvolvimento.

---

## 🧠 Visão do Projeto

O **Orquestra API** simula um sistema real de automação empresarial, onde usuários podem:

- criar projetos
- definir automações
- executar fluxos
- monitorar execuções
- analisar métricas operacionais

A proposta é reproduzir conceitos vistos em plataformas como Zapier, n8n e sistemas internos de automação corporativa, mas com implementação própria, foco em backend e estrutura pronta para evolução.

---

## ⚙️ Stack Tecnológica

### Backend
- PHP 8.3+
- Laravel
- PostgreSQL
- Laravel Sanctum
- Queue com driver de banco
- Pest / PHPUnit

### Frontend
- React
- TypeScript
- Vite
- Bootstrap

### DevOps
- Git
- GitHub Actions
- Docker (opcional)

---

## 🏗️ Arquitetura

    app/
     ├── Http/
     │   ├── Controllers/Api/
     │   └── Requests/
     ├── Jobs/
     ├── Models/
    database/
     ├── migrations/
     └── seeders/
    routes/
     └── api.php
    tests/
     └── Feature/

### Fluxo de execução

    Usuário → API → Automação → Run → Job em fila → Resultado

---

## 🔥 Funcionalidades

### 🔐 Autenticação
- registro de usuários
- login com geração de token
- logout
- rota para usuário autenticado
- proteção de rotas com Sanctum

### 📁 Projetos
- criação de projetos
- listagem por usuário
- atualização
- remoção
- isolamento de dados por usuário autenticado

### ⚙️ Automações
- criação e gerenciamento de automações
- associação com projetos
- configuração de execução
- execução manual

### ▶️ Execuções
- criação de runs
- status de processamento
- retry manual de falhas
- histórico de execuções

### 📊 Observabilidade
- tempo de execução em milissegundos
- quantidade de tentativas
- status da execução
- erro armazenado em caso de falha
- payload de retorno

### ❤️ Health Check
- status da aplicação
- status do banco
- endpoint de verificação operacional

### 📈 Métricas
- total de execuções
- execuções com sucesso
- execuções com falha
- execuções em fila
- execuções em andamento
- taxa de sucesso
- tempo médio de execução
- execuções do dia

---

## 🧪 Testes

O projeto possui testes automatizados para:

- autenticação
- projetos
- automações
- execuções
- health check
- métricas

Para rodar os testes:

    php artisan test

---

## 🚀 Como rodar o projeto

### 1. Clonar o repositório

    git clone https://github.com/arthuralbefaro/orquestra-api.git
    cd orquestra-api

### 2. Entrar no backend

    cd backend

### 3. Instalar dependências

    composer install

### 4. Configurar ambiente

    cp .env.example .env
    php artisan key:generate

### 5. Configurar o banco PostgreSQL no arquivo .env

Exemplo:

    DB_CONNECTION=pgsql
    DB_HOST=127.0.0.1
    DB_PORT=5432
    DB_DATABASE=orquestra
    DB_USERNAME=postgres
    DB_PASSWORD=postgres

### 6. Rodar migrations e seeders

    php artisan migrate
    php artisan db:seed

### 7. Subir a aplicação

    php artisan serve

### 8. Subir o worker da fila

Em outro terminal:

    php artisan queue:work

---

## 👤 Usuário de teste

    email: arthur@orquestra.dev
    senha: 12345678

---

## 🔌 Principais endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/health | Verifica status da API |
| POST | /api/register | Registra novo usuário |
| POST | /api/login | Realiza login |
| POST | /api/logout | Realiza logout |
| GET | /api/me | Retorna usuário autenticado |
| GET | /api/projects | Lista projetos |
| POST | /api/projects | Cria projeto |
| GET | /api/automations | Lista automações |
| POST | /api/automations | Cria automação |
| POST | /api/automations/{id}/run | Executa automação |
| POST | /api/runs/{id}/retry | Reprocessa execução |
| GET | /api/metrics | Retorna métricas operacionais |

---

## 🧠 Diferenciais Técnicos

- arquitetura backend organizada
- autenticação com Laravel Sanctum
- processamento assíncrono com filas
- observabilidade de execuções
- métricas operacionais reais
- testes automatizados
- integração contínua com GitHub Actions
- estrutura pronta para expansão

---

## 📌 Próximos passos

- dashboard frontend com gráficos
- filtros por status e data
- agendamento automático de execuções
- webhooks
- retry automático com backoff
- logs estruturados
- monitoramento visual no frontend

---

## 👨‍💻 Autor

Desenvolvido por **Arthur Albefaro**.

- GitHub: https://github.com/arthuralbefaro
- LinkedIn: adicione aqui o seu link

---

## ⭐ Considerações finais

O **Orquestra API** foi construído com foco em:

- boas práticas de backend
- código limpo
- organização de projeto
- arquitetura escalável
- simulação de cenário real de empresa

Mais do que um CRUD simples, este projeto busca demonstrar domínio de autenticação, filas, processamento assíncrono, testes e observabilidade, aproximando a implementação de um contexto profissional.