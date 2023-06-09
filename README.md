# Веб-приложение ТвойКомпас

Цифровая платформа ТвойКомпас, предоставляющая площадку для размещения
полезной информации о вузах и направлениях для абитуриентов.

Исходный код приложения:

https://github.com/KostarSf/remix-abiturients-app

# Запуск приложения

## По ссылке

Приложение развернуто с применением веб-хостинга Vercel и доступно по ссылке:

https://remix-abiturients-app.vercel.app/

## Оффлайн

Приложение можно запустить из исходного кода у себя на локальной машине.
Оно подключится к удаленной базе-данных и будет полноценно работать.

1. Загрузите и установите Node.js 18.13.0 -
   https://nodejs.org/dist/v18.13.0/node-v18.13.0-x64.msi

2. Склонируйте репозиторий, либо загрузите архив с исходным кодом проекта
   в отдельную папку, затем откройте папку проекта в проводнике.

3. Создайте в корне проекта файл `.env` и поместите следующие переменные окружения:

```sh
NODE_ENV="development"

# Валидная ссылка на PostgreSQL БД
DATABASE_URL="postgresql://юзер:пароль@адрес:5432/имя_бд?schema=public"
SESSION_SECRET="любая последовательность символов для шифрования куки"

# Данные переменные пока не реализованы
S3_KEY_ID="ключ от S3"
S3_SECRET_KEY="секретный ключ доступа от S3"
S3_BUCKET_NAME="имя бакета"

```

4. Откройте PowerShell в этой папке. Удерживая Shift,
   щелкните правкой кнопкой мыши по свободному месту в окне проводника,
   выберите пункт "Открыть окно PowerShell здесь".

5. Установите зависимости следующей командой в терминале:

```sh
pnpm install
```

6. Сгенерируйте модель базы данных:

```sh
npx prisma generate
```

7. Запустите проект командой:

```sh
pnpm run dev
```

Пока окно терминала не будет закрыто, сайт проекта будет доступен
локально у вас на компьютере по адресу http://localhost:3000

Чтобы завершить приложение, нажмите Ctrl + C в терминале, или просто
закройте его.

## Просмотр устройства базы данных

Находясь в терминале, в папке проекта, наберите следующую команду

```sh
npx prisma studio
```

Пока работает эта команда, посмотреть устройство базы данных можно
будет в браузере, по адресу http://localhost:5555

Команду можно запустить в новом отдельном окне терминала, чтобы не
выключать веб-приложение.

# Устройство приложения

Веб приложение работает на фуллстек фреймворке Remix, использующем внутри
себя React. База данных - PostgreSQL. Приложение использует S3 хранилище
для загрузки и хранения меда-контента. База данных и S3 хранилище развернуты
на хостинге TimeWeb.

- Основной код приложения находится в директории `app/`.
- В `app/routes` расположены все эндпониты приложения.
- Модели базы данных лежат в `app/models`. <br>
  Сама схема базы данных находится в `prisma/schema.prisma`
