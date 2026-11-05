const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'todos.json');
const DIST_DIR = path.join(__dirname, 'dist', 'todo-app', 'browser');

function loadTodos() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const todos = loadTodos();

  if (url.pathname === '/api/todos' && req.method === 'GET') {
    return sendJson(res, 200, todos);
  }

  if (url.pathname === '/api/todos' && req.method === 'POST') {
    const { title } = await readBody(req);
    if (!title || !title.trim()) {
      return sendJson(res, 400, { error: 'title is required' });
    }
    const todo = { id: Date.now(), title: title.trim(), done: false };
    todos.push(todo);
    saveTodos(todos);
    return sendJson(res, 201, todo);
  }

  const todoMatch = url.pathname.match(/^\/api\/todos\/(\d+)$/);
  if (todoMatch && req.method === 'PATCH') {
    const todo = todos.find((t) => t.id === Number(todoMatch[1]));
    if (!todo) {
      return sendJson(res, 404, { error: 'todo not found' });
    }
    const { done } = await readBody(req);
    todo.done = Boolean(done);
    saveTodos(todos);
    return sendJson(res, 200, todo);
  }

  // Serve the Angular build
  if (req.method === 'GET') {
    const filePath = path.join(DIST_DIR, url.pathname === '/' ? 'index.html' : url.pathname);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.writeHead(200);
      fs.createReadStream(filePath).pipe(res);
    } else {
      const index = path.join(DIST_DIR, 'index.html');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(index).pipe(res);
    }
    return;
  }

  sendJson(res, 404, { error: 'not found' });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
