# TrustBridge Web

Веб-клиент TrustBridge: форк `element-hq/element-web` (монорепозиторий, приложение в `apps/web`).
Версия форка: 1.12.27. Remote `origin` = `DFLEXX13/trustbridge-web`, рабочая ветка `develop`, `upstream` = Element.
Владелец — не разработчик: объяснения короткие и по-русски. Связанный репозиторий: `../trustbridge-desktop`.

## Сборка
- Node из `.node-version` (24), pnpm. Сборка клиента: `pnpm --filter element-web build`, результат в `apps/web/webapp/`.
- Десктоп собирает веб отсюда: локально `pnpm run build:element-web` в `../trustbridge-desktop`,
  а его CI (`build-trustbridge.yml`) берёт **вершину `develop` этого репозитория** (ref не зафиксирован).
  Всё, что попало в `develop`, попадёт в следующий десктопный релиз.
- `webapp/` не содержит `config.json`: в форке только `apps/web/config.sample.json`.

## Что где лежит
- `apps/web/src/SdkConfig.ts` (строки 61–64): ссылки скачивания десктопа на релиз `trustbridge-desktop` (сейчас v1.12.14).
  Менять при каждом новом десктопном релизе, файлы проверять `curl -sIL` (ожидается 200).
- `apps/web/res/media/`: звуки уведомлений и звонка (`message.*`, `ring.*`), `backup_original/` в `.gitignore`.

## Боевой сайт chat.trustbridge.space (на 19.09.2026)
- Сейчас там стандартный Element Web **1.11.76-rc.0** (сборка августа 2024, `<title>Element</title>`) на nginx.
  Это не сборка из этого репозитория: новых звуков и ссылок на 1.12.14 там нет.
- `config.json` лежит только на сервере (в репозитории его нет). Публично отдаётся `/config.json`.
  **Не перезаписывать и не удалять его при выкладке**; брать копию и сверять ключи с `config.sample.json`.
- Ключи боевого `config.json`, которых нет в примере форка: `setting_defaults.UIFeature.{registration,passwordReset,deactivate}`,
  `element_call.{url,participant_limit}`. Есть только в примере: `force_verification`, `default_widget_container_height`,
  `element_call.{disable,use_exclusively}`. Значения здесь не записаны.
- **Способ выкладки неизвестен.** В репозитории нет скриптов деплоя; унаследованные от Element workflow (`deploy.yml` и др.)
  не используются (секретов и запусков нет). Перед выкладкой спросить владельца: куда, как, какая папка.
- Тестовый адрес: `chat-dev.trustbridge.space` (на том же сервере, `<title>TrustBridge</title>`, `/version` = `5c7a0d40`,
  такого коммита в истории репозитория нет). Как он выкладывается, неизвестно.

## Выкладка (когда способ станет известен)
- Сначала на тестовый адрес, проверить вход, звонок, звуки; только потом на боевой.
- Сборка строго из чистого дерева на запушенном коммите. Перед выкладкой сохранить копию текущей папки клиента (откат).
- Без `--delete`, файлы сервера, которых нет в сборке (особенно `config*.json`), не трогать.
- Откат: вернуть сохранённую копию папки. Пока копии нет, откатить нечем.
- Проверка после выкладки: `curl -sL https://chat.trustbridge.space/version` (ожидается 1.12.27), в `index.html` и подключённых JS
  нет `v1.12.13`, есть `v1.12.14`; `media/message.*` и `ring.*` отдаются 200 с тем же размером, что локальные файлы;
  `config.json` отдаётся 200, бренд TrustBridge; смотреть `Cache-Control` у `index.html` и звуков.

## Соглашения
- Файлы `LICENSE-*` и заголовки copyright не трогать.
- Секреты и значения `config.json` в репозиторий и в чат не выносить. IP сервера здесь не записывается.
- Коммит и `push` только по просьбе владельца; `push` сам ничего не выкладывает (workflow не запускаются).
