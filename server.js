const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const HOST = '127.0.0.1';
const indexPath = path.join(__dirname, 'index.html');
const staticFiles = {
  '/styles.css': { file: path.join(__dirname, 'styles.css'), type: 'text/css; charset=utf-8' },
  '/main.js': { file: path.join(__dirname, 'main.js'), type: 'text/javascript; charset=utf-8' },
  '/pages/main/index.js': { file: path.join(__dirname, 'pages/main/index.js'), type: 'text/javascript; charset=utf-8' },
  '/pages/product/index.js': { file: path.join(__dirname, 'pages/product/index.js'), type: 'text/javascript; charset=utf-8' },
  '/components/product-card/index.js': { file: path.join(__dirname, 'components/product-card/index.js'), type: 'text/javascript; charset=utf-8' },
  '/components/product/index.js': { file: path.join(__dirname, 'components/product/index.js'), type: 'text/javascript; charset=utf-8' },
  '/components/back-button/index.js': { file: path.join(__dirname, 'components/back-button/index.js'), type: 'text/javascript; charset=utf-8' }
};

// Mock-объекты: учебная коллекция, не реальные данные телеметрии.
const cars = [
  {
    id: 1,
    name: 'Mercedes-AMG F1 W15',
    season: 2024,
    number: '44',
    driver: 'Lewis Hamilton',
    team: 'Mercedes-AMG PETRONAS',
    engine: 'Mercedes-AMG F1 M15 E Performance',
    description: 'Болид сезона 2024 года, созданный для борьбы за позиции в чемпионате. Карточка использует демонстрационные данные для учебной коллекции.',
    color: 'PETRONAS Black / Teal',
    status: 'Архив'
  },
  {
    id: 2,
    name: 'Mercedes-AMG F1 W14',
    season: 2023,
    number: '63',
    driver: 'George Russell',
    team: 'Mercedes-AMG PETRONAS',
    engine: 'Mercedes-AMG F1 M14 E Performance',
    description: 'Модель сезона 2023 года. В подробной карточке собраны основные mock-поля: сезон, пилот, команда и силовая установка.',
    color: 'Black / PETRONAS Teal',
    status: 'Архив'
  },
  {
    id: 3,
    name: 'Mercedes-AMG F1 W13',
    season: 2022,
    number: '44',
    driver: 'Lewis Hamilton',
    team: 'Mercedes-AMG PETRONAS',
    engine: 'Mercedes-AMG F1 M13 E Performance',
    description: 'Болид сезона 2022 года. Запись нужна для демонстрации фильтрации и навигации к отдельной странице объекта.',
    color: 'Silver / Black',
    status: 'Архив'
  },
  {
    id: 4,
    name: 'Mercedes-AMG F1 W15 · #63',
    season: 2024,
    number: '63',
    driver: 'George Russell',
    team: 'Mercedes-AMG PETRONAS',
    engine: 'Mercedes-AMG F1 M15 E Performance',
    description: 'Вариант карточки W15 с данными второго пилота команды. Все значения являются частью локального набора mock-объектов.',
    color: 'PETRONAS Black / Teal',
    status: 'Коллекция'
  }
];

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);

  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
    fs.readFile(indexPath, (error, content) => {
      if (error) {
        res.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
        res.end('Не удалось прочитать index.html');
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      });
      res.end(content);
    });
    return;
  }

  if (req.method === 'GET' && staticFiles[url.pathname]) {
    const asset = staticFiles[url.pathname];
    fs.readFile(asset.file, (error, content) => {
      if (error) {
        res.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
        res.end('Не удалось прочитать статический файл');
        return;
      }
      res.writeHead(200, {
        'Content-Type': asset.type,
        'Cache-Control': 'no-store'
      });
      res.end(content);
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/cars') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store'
    });
    res.end(JSON.stringify(cars, null, 2));
    return;
  }

  res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
  res.end('404 — Страница не найдена');
});

server.listen(PORT, HOST, () => {
  console.log(`Mercedes-AMG F1 Lab 3 доступна: http://${HOST}:${PORT}`);
  console.log('Для проверки данных откройте: http://127.0.0.1:' + PORT + '/api/cars');
});
