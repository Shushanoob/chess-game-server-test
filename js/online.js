/* online.js — сетевая игра: подключение к серверу (см. server/), быстрый подбор и комнаты по коду. */
const Online = (() => {
  let ws = null, handlers = {};

  const open = () => new Promise((resolve, reject) => {
    if (ws && ws.readyState === 1) return resolve();
    if (!ONLINE_URL) return reject(new Error('not-configured'));
    let settled = false;
    const fail = err => { if (settled) return; settled = true; try { ws && ws.close(); } catch (_) {} reject(err); };
    try { ws = new WebSocket(ONLINE_URL); } catch (e) { return fail(e); }
    const timer = setTimeout(() => fail(new Error('timeout')), 8000);
    ws.onopen = () => { if (!settled) { settled = true; clearTimeout(timer); resolve(); } };
    ws.onerror = () => fail(new Error('connect'));
    ws.onmessage = e => { let m; try { m = JSON.parse(e.data); } catch (x) { return; } if (handlers.message) handlers.message(m); };
    ws.onclose = () => { clearTimeout(timer); if (handlers.close) handlers.close(); };
  });
  const send = m => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(m)); };
  const close = () => { handlers = {}; if (ws) ws.close(); ws = null; };

  return { open, send, close, on: h => { handlers = h; }, available: () => !!ONLINE_URL };
})();
