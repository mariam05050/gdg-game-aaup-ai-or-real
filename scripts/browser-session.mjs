import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

// Optional browser checks use an installed Chrome/Edge, without extra dependencies.
export async function openBrowser(port, { timeoutMs = 15000 } = {}) {
  const executable = [process.env.BROWSER_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].find(candidate => candidate && existsSync(candidate));
  if (!executable) throw new Error('Install Chrome/Edge or set BROWSER_PATH to its executable.');
  const child = spawn(executable, ['--headless', '--disable-gpu', '--no-first-run',
    '--disable-extensions', '--disable-background-networking', `--remote-debugging-port=${port}`,
    `--user-data-dir=${path.resolve(`.tmp/round-flow-profile-${process.pid}`)}`, 'about:blank',
  ], { windowsHide: true, stdio: 'ignore' });
  let socket;
  let nextId = 0;
  const pending = new Map();
  const errors = [];
  try {
    let tabs;
    for (let i = 0; i < 100; i++) {
      try { tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); break; }
      catch { await new Promise(resolve => setTimeout(resolve, 100)); }
    }
    if (!tabs) throw new Error('Browser debugging endpoint did not start.');
    socket = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', reject, { once: true });
    });
    socket.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const request = pending.get(message.id);
        pending.delete(message.id);
        if (!request) return;
        if (message.error) request.reject(new Error(JSON.stringify(message.error)));
        else request.resolve(message.result);
      } else if (message.method === 'Runtime.exceptionThrown') errors.push(message.params);
    });
  } catch (error) { child.kill(); throw error; }
  function call(method, params = {}) {
    const id = ++nextId;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async function evaluate(expression) {
    const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  }
  async function waitFor(expression) {
    for (let i = 0; i < Math.ceil(timeoutMs / 100); i++) {
      if (await evaluate(expression)) return;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    const state = await evaluate(`({url:location.href,ready:document.readyState,availability:document.querySelector('#availability')?.textContent})`);
    throw new Error(`Timed out: ${expression}; page state: ${JSON.stringify(state)}`);
  }
  function close() {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ id: ++nextId, method: 'Browser.close' }));
      socket.close();
    }
    child.kill();
  }
  return { call, evaluate, waitFor, errors, close };
}
