/* Background removal in its own thread (a Web Worker), so the studio keeps scrolling, typing and moving parts while a
   photo is being cut out. Gets { id, blob, model }, posts progress messages and finally { id, blob } or { id, error }. */
importScripts('../lib/bg-removal.js');
self.onmessage = async e => {
  const { id, blob, model } = e.data;
  try {
    const out = await BgRemoval.removeBackground(blob, {
      model, proxyToWorker: false, output: { format: 'image/png', quality: 1 },
      progress: (k, cur, total) => self.postMessage({ id, progress: { k, cur, total } }),
    });
    self.postMessage({ id, blob: out });
  } catch (err) {
    self.postMessage({ id, error: String(err && err.message || err) });
  }
};
