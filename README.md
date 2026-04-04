# Orquestra API

Sistema full stack para gerenciamento e execução de automações, com foco em observabilidade, organização de projetos e processamento assíncrono.

## Visão geral

O Orquestra API é uma aplicação desenvolvida para centralizar projetos, automações e execuções em uma interface moderna e operacional. A plataforma permite cadastrar fluxos, disparar execuções manualmente, acompanhar histórico, visualizar métricas de desempenho e trabalhar com processamento em fila.

## Principais funcionalidades

- Autenticação com Laravel Sanctum
- Cadastro e login de usuários
- CRUD completo de projetos
- CRUD completo de automações
- Execução manual de automações
- Retry de execuções
- Histórico de runs por automação
- Dashboard com métricas operacionais
- Ranking de automações mais executadas
- Atualização visual de estados de execução
- Tema dark/light
- Interface moderna com React + TypeScript + Vite
- Processamento assíncrono com Laravel Queue

## Arquitetura do Sistema

O Orquestra API segue uma arquitetura full stack desacoplada, com separação clara entre backend (API) e frontend (interface), além de suporte a processamento assíncrono via filas.

### Visão geral da arquitetura

```text
Frontend (React)
      ↓
API REST (Laravel)
      ↓
Banco de Dados (PostgreSQL)
      ↓
Fila (Queue - Database)
      ↓
Worker (Processamento assíncrono)
```

### Backend
- Laravel
- PostgreSQL
- Sanctum
- Queue (database)

### Frontend
- React
- TypeScript
- Vite
- Recharts
- React Router

## Como rodar

### Backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan queue:table
php artisan migrate
php artisan serve

### Worker
php artisan queue:work

### Frontend
cd frontend
npm install
npm run dev

## Autor

Arthur Nascimento Albefaro Penna