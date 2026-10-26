# greeful

Telegram Mini App: календарь биоритмов, материалы и дневник настроения.

Стек: Next.js 16 (App Router, Cache Components) · React 19.3 (`<ViewTransition>`) · Tailwind CSS 4 · lucide-react.

## Запуск

```bash
npm install
cp .env.example .env.local
npm run dev
```

Вне Telegram при `next dev` приложение открывается под тестовым пользователем «Гость» — удобно смотреть вёрстку в браузере (мобильный режим, ~390px). На проде вне Telegram показывается экран «Откройте в Telegram».

## Подключение к боту

1. В @BotFather: `/newapp` (или Bot Settings → Menu Button) и HTTPS-адрес приложения.
2. `TELEGRAM_BOT_TOKEN` в окружении — без него сервер не сможет проверить подпись `initData`.

## Как устроено

```
src/
  app/          только маршруты: тонкие page/layout + API (route handlers)
  modules/      фичи — данные, действия и экраны рядом
    telegram/     SDK-обёртка, провайдер сессии, тема, кнопка «Назад»; server/ — проверка initData, аватар
    session/      состояние пользователя (с проверкой при чтении), хранилище, SessionGate
    onboarding/   шаги входа; survey/ — анкета-свайп и обучение жесту
    subscription/ проверка подписки по почте (GetCourse, сейчас демо)
    biorhythm/    расчёт циклов, график, экран «Биоритмы»
    diary/        эмоция дня (карусель), неделя, заметки
    library/ profile/ home/ reminders/
    shell/        каркас: обёртки страниц, навигация, шапки, типы переходов
  ui/           примитивы дизайн-системы (кнопки, поля с живой проверкой, шторка, тосты…)
  lib/          общие утилиты (даты, валидация, localStorage, хуки)
```

- **Вход.** `TelegramProvider` открывает интерфейс сразу по данным Telegram и параллельно отправляет `initData` на `/api/telegram/session`: сервер проверяет HMAC-подпись и возраст данных. Отклонённая подпись — экран ошибки. Аватар — `photo_url`, а если его нет — `/api/telegram/avatar` (Bot API, ссылка подписана токеном).
- **Страницы.** Каждая `page.tsx` оборачивает экран в `OnboardingPage` / `AppPage` (`modules/shell/page-gates.tsx`): сессия, проверка шага онбординга и `<ViewTransition>`. Обёртки стоят в страницах, а не в layout — так Next рендерит сегмент страницы на сервере и проверяет instant-навигацию.
- **Анимации.** Переходы между экранами — `transitionTypes` у ссылок (`nav-forward`, `nav-back`, `nav-tab`) и CSS в `globals.css`. Свайп карточки анкеты, карусель эмоций и график двигаются через прямую запись стилей в DOM, без перерисовки React на каждом кадре. Всё отключается при `prefers-reduced-motion`.
- **Данные** — в `localStorage`, отдельно для каждого Telegram-аккаунта (`greeful:user:<id>`; данные со старого ключа `bioform:user:<id>` переносятся сами). Чтобы хранить на сервере, достаточно заменить чтение/запись в `modules/session/store.ts`.
- **Тема** — светлая/тёмная по теме Telegram (вне Telegram — по системе), применяется до первой отрисовки. Цвета — палитра next_ai, токены в `src/app/globals.css`.

## Что пока заглушка

- Проверка подписки в GetCourse — `modules/subscription/server.ts`.
- Разделы материалов с пометкой «Скоро».
