# Yavimax Messenger

Yavimax — это современный кроссплатформенный мессенджер с поддержкой реального времени, обмена медиафайлами и голосовыми сообщениями. Проект разработан в рамках учебной дисциплины «Технологии разработки программных приложений».

## Архитектура проекта

Проект разделен на три основных модуля:
- **backend**: Серверная часть на Java (Spring Boot 4.0.3, Hibernate 7).
- **frontend**: Основное клиентское веб-приложение (React, Vite, Tailwind CSS).
- **frontend-web**: Дополнительный модуль интерфейса.

## Технологии и зависимости

### Backend
- **Java 21**
- **Spring Boot 4.0.3**: REST API, WebSockets (STOMP), Security.
- **PostgreSQL 16**: Основное хранилище данных.
- **Redis 7**: Кэширование и управление сессиями присутствия.
- **Gradle**: Система сборки.
- **Lombok**: Сокращение шаблонного кода.

### Frontend
- **React 18**
- **Vite 6**: Сборка и dev-сервер.
- **Zustand**: Управление состоянием (State Management).
- **Tailwind CSS 4**: Стилизация.
- **StompJS/SockJS**: Работа с WebSocket.

## Требования для запуска
- Docker и Docker Compose
- JDK 21+
- Node.js 18+

## Команды для запуска

### 1. Запуск инфраструктуры
```bash
cd backend
docker-compose up -d
```

### 2. Запуск бэкенда
```bash
cd backend
./gradlew bootRun
```

### 3. Запуск фронтенда
```bash
cd frontend
npm install
npm run dev
```

## Сборка документации

### Backend (Javadoc)
Генерация HTML-документации по коду:
```bash
cd backend
./gradlew javadoc
```
Результат будет доступен в `backend/build/docs/javadoc/index.html`.

### Frontend (TypeDoc)
Генерация документации TypeScript:
```bash
cd frontend
npm run docs
```
