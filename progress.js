
(function(){
  const KEY = 'escorp_engine_progress_v1';
  const ORDER = ['hub','harness','brain','connect','media-buyer','creatives','checkoff','run'];
  const FILES = {
    hub:'index.html',
    harness:'01-harness.html',
    brain:'02-brain.html',
    connect:'03-connect.html',
    'media-buyer':'04-media-buyer.html',
    creatives:'05-creatives.html',
    checkoff:'06-checkoff.html',
    run:'07-run.html'
  };
  function load(){
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
    catch(e){ return {}; }
  }
  function save(p){ localStorage.setItem(KEY, JSON.stringify(p)); }
  function doneSet(){
    const p = load();
    return new Set(Object.keys(p).filter(k => p[k]));
  }
  function isDone(id){ return !!load()[id]; }
  function markDone(id){
    const p = load(); p[id] = true; save(p);
  }
  function firstIncomplete(){
    for (const id of ORDER.slice(1)) if (!isDone(id)) return id;
    return 'run';
  }
  function canOpen(id){
    if (id === 'hub') return true;
    const idx = ORDER.indexOf(id);
    if (idx <= 1) return true; // harness always open
    // prior lesson must be done
    for (let i = 1; i < idx; i++) if (!isDone(ORDER[i])) return false;
    return true;
  }
  function nextId(id){
    const i = ORDER.indexOf(id);
    return ORDER[i+1] || null;
  }
  window.EngineProgress = { load, save, isDone, markDone, canOpen, nextId, firstIncomplete, ORDER, FILES, doneSet };

  // Paint hub lessons
  document.querySelectorAll('[data-lesson]').forEach(el => {
    const id = el.getAttribute('data-lesson');
    const pill = el.querySelector('.status-pill');
    if (isDone(id)) {
      el.classList.add('done');
      if (pill) pill.textContent = 'Done ✓';
    } else if (!canOpen(id)) {
      el.classList.add('locked');
      if (pill) pill.textContent = 'Locked';
      el.setAttribute('href', '#');
      el.addEventListener('click', e => { e.preventDefault(); alert('Finish the previous lesson and tick it off first.'); });
    } else if (pill && pill.textContent === 'Next') {
      // keep
    }
  });

  // Paint step nav
  document.querySelectorAll('.step-nav a[data-lesson]').forEach(a => {
    const id = a.getAttribute('data-lesson');
    if (isDone(id)) a.classList.add('done');
    if (id !== 'hub' && !canOpen(id)) {
      a.addEventListener('click', e => {
        e.preventDefault();
        alert('Finish the previous lesson and tick it off first.');
      });
    }
  });

  // Progress dots
  const dotsHost = document.querySelector('[data-progress-dots]');
  if (dotsHost) {
    ORDER.slice(1).forEach((id, i) => {
      const d = document.createElement('div');
      d.className = 'dot';
      d.textContent = String(i+1);
      if (isDone(id)) d.classList.add('done');
      const cur = dotsHost.getAttribute('data-current');
      if (cur === id) d.classList.add('current');
      dotsHost.appendChild(d);
    });
  }

  // Checkoff button
  const btn = document.querySelector('[data-mark-done]');
  if (btn) {
    const id = btn.getAttribute('data-mark-done');
    const next = nextId(id);
    if (isDone(id)) {
      btn.textContent = 'Done ✓ — continue →';
      btn.classList.add('done');
      if (next) btn.onclick = () => location.href = FILES[next];
      else btn.onclick = () => location.href = 'index.html';
    } else {
      btn.addEventListener('click', () => {
        markDone(id);
        if (next) location.href = FILES[next];
        else location.href = 'index.html';
      });
    }
  }


  // Gate footer "Next" until this lesson is ticked off
  document.querySelectorAll('.footer-nav a.btn').forEach(a => {
    const btn = document.querySelector('[data-mark-done]');
    if (!btn) return;
    const id = btn.getAttribute('data-mark-done');
    const next = nextId(id);
    if (!next) return;
    if (!isDone(id)) {
      a.addEventListener('click', e => {
        e.preventDefault();
        alert('Tick this lesson off first — then the next one unlocks.');
      });
      a.style.opacity = '0.45';
    } else {
      a.setAttribute('href', FILES[next]);
    }
  });

  // Hub CTA → first incomplete
  const start = document.querySelector('[data-start-continue]');
  if (start) {
    const id = firstIncomplete();
    start.setAttribute('href', FILES[id]);
    const nDone = ORDER.slice(1).filter(isDone).length;
    if (nDone > 0 && nDone < 7) start.textContent = 'Continue — Lesson ' + (ORDER.indexOf(id)) + ' →';
    else if (nDone >= 7) start.textContent = 'All done — review Hub →';
  }
})();
