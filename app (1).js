const $ = s => document.querySelector(s);
const LS = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch (e) { return d } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} }
};
let fs = LS.get('fs', { 'Bienvenue.txt': 'Bienvenue sur Windows 11 Web !\nVos fichiers sont enregistrés dans ce navigateur.' });
const cfg = Object.assign({ theme: 'dark', wall: 0 }, LS.get('cfg', {}));
const WALLS = [
  'radial-gradient(45% 55% at 50% 62%,#2a7cf0 0,#0c3fb0 42%,transparent 72%),radial-gradient(40% 50% at 12% 12%,#c4e2ff 0,transparent 70%),radial-gradient(40% 50% at 92% 18%,#9cbcff 0,transparent 70%),linear-gradient(#e3efff,#a6c6f4)',
  'radial-gradient(60% 80% at 70% 70%,#e0457b 0,transparent 60%),radial-gradient(50% 60% at 30% 30%,#ff9f43 0,transparent 60%),#3a0f33',
  'radial-gradient(70% 80% at 50% 80%,#12a085 0,transparent 60%),#06231f',
  'linear-gradient(135deg,#232526,#414345)'
];
function applyCfg() {
  document.body.dataset.theme = cfg.theme;
  document.body.style.setProperty('--wall', WALLS[cfg.wall]);
  document.documentElement.style.filter = `brightness(${cfg.bright || 100}%)`;
  LS.set('cfg', cfg);
}

const apps = {
  files: { t: 'Explorateur de fichiers', i: '📁', w: 560, h: 380, r: filesApp },
  notes: { t: 'Bloc-notes', i: '📝', w: 480, h: 360, r: notesApp },
  calc: { t: 'Calculatrice', i: '🧮', w: 280, h: 400, r: calcApp },
  web: { t: 'Navigateur', i: '🌐', w: 720, h: 480, r: webApp },
  set: { t: 'Paramètres', i: '⚙️', w: 420, h: 320, r: setApp }
};

const sv = b => `<svg class="i" viewBox="0 0 32 32">${b}</svg>`;
const IC = {
  files: sv('<path fill="#f0b429" d="M3 8a2 2 0 0 1 2-2h7l3 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path fill="#ffd96b" d="M3 12h26v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
  notes: sv('<rect x="6" y="3" width="20" height="26" rx="3" fill="#4fc3f7"/><path stroke="#fff" stroke-width="2" d="M10 11h12M10 16h12M10 21h8"/>'),
  calc: sv('<rect x="5" y="3" width="22" height="26" rx="3" fill="#455a64"/><rect x="9" y="7" width="14" height="5" rx="1" fill="#b2dfdb"/><g fill="#fff"><circle cx="11" cy="17" r="1.6"/><circle cx="16" cy="17" r="1.6"/><circle cx="21" cy="17" r="1.6"/><circle cx="11" cy="23" r="1.6"/><circle cx="16" cy="23" r="1.6"/><circle cx="21" cy="23" r="1.6"/></g>'),
  web: sv('<circle cx="16" cy="16" r="13" fill="#0ea5a4"/><path fill="#1e6fe0" d="M16 3a13 13 0 0 1 12 18c-4 3-10 2-12-2-2-4 1-8 6-8-3-4-8-4-12-1A13 13 0 0 1 16 3z"/>'),
  set: sv('<circle cx="16" cy="16" r="5" fill="none" stroke="#9aa5b1" stroke-width="3"/><path stroke="#9aa5b1" stroke-width="4" stroke-linecap="round" d="M16 3v4M16 25v4M3 16h4M25 16h4M7 7l3 3M22 22l3 3M25 7l-3 3M10 22l-3 3"/>')
};
Object.keys(IC).forEach(k => apps[k].i = IC[k]);

/* ---------- Gestionnaire de fenêtres ---------- */
let z = 10, n = 0;
function launch(id, arg) {
  const a = apps[id], uid = ++n;
  const w = document.createElement('div');
  w.className = 'win';
  w.style.cssText = `width:${Math.min(a.w, innerWidth - 12)}px;height:${Math.min(a.h, innerHeight - 60)}px;left:${Math.max(0, Math.min(40 + (uid % 8) * 28, innerWidth - a.w))}px;top:${20 + (uid % 8) * 28}px`;
  w.innerHTML = `<div class="tb"><span>${a.i} ${a.t}</span><b data-a="min">–</b><b data-a="max">▢</b><b data-a="x">✕</b></div><div class="bd"></div>`;
  $('#wins').append(w);
  const btn = document.createElement('button');
  btn.innerHTML = a.i; btn.title = a.t;
  $('#run').append(btn);
  const front = () => {
    w.style.zIndex = ++z; w.classList.remove('min');
    document.querySelectorAll('#run button').forEach(b => b.classList.remove('top'));
    btn.classList.add('top');
  };
  btn.classList.add('on');
  btn.onclick = () => {
    if (w.classList.contains('min')) front();
    else if (btn.classList.contains('top')) { w.classList.add('min'); btn.classList.remove('top'); }
    else front();
  };
  w.addEventListener('pointerdown', front);
  const tb = w.querySelector('.tb');
  tb.onclick = e => {
    const act = e.target.dataset.a;
    if (act === 'x') { w.remove(); btn.remove(); }
    if (act === 'min') { w.classList.add('min'); btn.classList.remove('top'); }
    if (act === 'max') w.classList.toggle('max');
  };
  tb.ondblclick = e => { if (!e.target.dataset.a) w.classList.toggle('max'); };
  tb.onpointerdown = e => {
    if (e.target.dataset.a || w.classList.contains('max')) return;
    const dx = e.clientX - w.offsetLeft, dy = e.clientY - w.offsetTop;
    tb.setPointerCapture(e.pointerId);
    tb.onpointermove = m => {
      w.style.left = Math.max(-w.offsetWidth + 80, Math.min(m.clientX - dx, innerWidth - 80)) + 'px';
      w.style.top = Math.max(0, Math.min(m.clientY - dy, innerHeight - 90)) + 'px';
    };
    tb.onpointerup = () => { tb.onpointermove = null; };
  };
  a.r(w.querySelector('.bd'), arg);
  front();
  closeStart();
}

/* ---------- Applications ---------- */
function filesApp(bd) {
  const draw = () => {
    if (!bd.isConnected) return removeEventListener('fschange', draw);
    bd.innerHTML = '<div class="tool"><button class="btn" id="nf">＋ Nouveau fichier</button><span>Documents</span></div><div class="list"></div>';
    const l = bd.querySelector('.list');
    Object.keys(fs).sort().forEach(k => {
      const d = document.createElement('div');
      d.innerHTML = `<span>📄</span>${k.replace(/</g, '&lt;')}`;
      d.title = 'Double-clic pour ouvrir, clic droit pour supprimer';
      d.ondblclick = () => launch('notes', k);
      d.oncontextmenu = e => { e.preventDefault(); if (confirm(`Supprimer « ${k} » ?`)) { delete fs[k]; LS.set('fs', fs); dispatchEvent(new Event('fschange')); } };
      l.append(d);
    });
    bd.querySelector('#nf').onclick = () => launch('notes');
  };
  addEventListener('fschange', draw);
  draw();
}

function notesApp(bd, name) {
  bd.innerHTML = '<div class="tool"><input class="name" aria-label="Nom du fichier"><button class="btn">Enregistrer</button></div><textarea spellcheck="false"></textarea>';
  const nm = bd.querySelector('.name'), ta = bd.querySelector('textarea'), sv = bd.querySelector('.btn');
  nm.value = name || 'Sans titre.txt';
  ta.value = fs[name] || '';
  sv.onclick = () => {
    fs[nm.value.trim() || 'Sans titre.txt'] = ta.value;
    LS.set('fs', fs); dispatchEvent(new Event('fschange'));
    sv.textContent = 'Enregistré ✓'; setTimeout(() => sv.textContent = 'Enregistrer', 1200);
  };
}

function calcApp(bd) {
  bd.innerHTML = '<div class="disp">0</div><div class="keys"></div>';
  const d = bd.querySelector('.disp'), k = bd.querySelector('.keys');
  let e = '';
  const show = () => d.textContent = e || '0';
  'C ( ) ⌫ 7 8 9 ÷ 4 5 6 × 1 2 3 − 0 . = +'.split(' ').forEach(c => {
    const b = document.createElement('button');
    b.textContent = c; if (c === '=') b.className = 'eq';
    b.onclick = () => {
      if (c === 'C') e = '';
      else if (c === '⌫') e = e.slice(0, -1);
      else if (c === '=') {
        const x = e.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
        try { e = /^[0-9+\-*/.() ]+$/.test(x) ? String(+Function('"use strict";return(' + x + ')')().toFixed(10)) : ''; } catch (_) { e = ''; d.textContent = 'Erreur'; return; }
      } else e += c;
      show();
    };
    k.append(b);
  });
}

function webApp(bd) {
  bd.innerHTML = '<div class="tool"><input placeholder="Adresse ou recherche Wikipédia" aria-label="Adresse"><button class="btn">Aller</button></div><iframe sandbox="allow-scripts allow-same-origin allow-forms allow-popups" src="https://fr.wikipedia.org/wiki/Windows_11"></iframe>';
  const i = bd.querySelector('input'), f = bd.querySelector('iframe');
  const go = () => {
    const v = i.value.trim(); if (!v) return;
    f.src = /^https?:\/\//.test(v) ? v : /^[^\s]+\.[a-z]{2,}/i.test(v) ? 'https://' + v : 'https://fr.wikipedia.org/w/index.php?search=' + encodeURIComponent(v);
  };
  bd.querySelector('.btn').onclick = go;
  i.onkeydown = e => { if (e.key === 'Enter') go(); };
}

function setApp(bd) {
  bd.innerHTML = '<div class="set"><b>Thème</b><div><button class="btn" data-t="dark">Sombre</button><button class="btn" data-t="light">Clair</button></div><b>Arrière-plan</b><div id="ws"></div></div>';
  const mark = () => bd.querySelectorAll('[data-t]').forEach(b => b.classList.toggle('sel', b.dataset.t === cfg.theme));
  bd.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { cfg.theme = b.dataset.t; applyCfg(); mark(); });
  WALLS.forEach((w, i) => {
    const s = document.createElement('div');
    s.className = 'sw'; s.style.background = w; s.tabIndex = 0;
    s.onclick = () => { cfg.wall = i; applyCfg(); };
    bd.querySelector('#ws').append(s);
  });
  mark();
}

/* ---------- Bureau, menu Démarrer, horloge ---------- */
const coarse = matchMedia('(pointer:coarse)').matches;
Object.entries(apps).forEach(([id, a]) => {
  const d = document.createElement('div');
  d.className = 'ico'; d.innerHTML = `<span>${a.i}</span>${a.t}`;
  d.addEventListener(coarse ? 'click' : 'dblclick', () => launch(id));
  $('#desktop').append(d);
  const b = document.createElement('button');
  b.innerHTML = `<span>${a.i}</span>${a.t}`; b.dataset.n = a.t.toLowerCase();
  b.onclick = () => launch(id);
  $('#apps').append(b);
});
const closeStart = () => closeAll();
$('#sbtn').onclick = e => { e.stopPropagation(); $('#start').classList.toggle('hidden'); $('#q').value = ''; $('#q').oninput(); $('#q').focus(); };
$('#start').onclick = e => e.stopPropagation();
document.addEventListener('click', closeStart);
$('#q').oninput = () => document.querySelectorAll('#apps button').forEach(b => b.classList.toggle('hidden', !b.dataset.n.includes($('#q').value.toLowerCase())));
$('#off').onclick = () => location.reload();
const tick = () => {
  const t = new Date();
  $('#clock').innerHTML = t.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '<br>' + t.toLocaleDateString('fr-FR');
};
tick(); setInterval(tick, 10000);
applyCfg();

/* ---------- Menu Démarrer, calendrier, paramètres rapides ---------- */
function closeAll() { ['#start', '#cal', '#qs'].forEach(x => $(x).classList.add('hidden')); }
function toggle(id, before) {
  const was = $(id).classList.contains('hidden');
  closeAll();
  if (was) { if (before) before(); $(id).classList.remove('hidden'); }
}
function renderRec() {
  const r = $('#rec'); r.innerHTML = '';
  const ks = Object.keys(fs).slice(0, 6);
  if (!ks.length) r.textContent = 'Aucun fichier récent';
  ks.forEach(k => {
    const d = document.createElement('div');
    d.innerHTML = IC.notes; d.append(k);
    d.onclick = () => launch('notes', k);
    r.append(d);
  });
}
function openStart(focus) {
  toggle('#start', () => { renderRec(); $('#q').value = ''; $('#q').oninput(); });
  if (focus) $('#q').focus();
}
$('#sbtn').onclick = e => { e.stopPropagation(); openStart(); };
$('#sch').onclick = e => { e.stopPropagation(); openStart(true); };
document.querySelectorAll('.fly').forEach(f => f.onclick = e => e.stopPropagation());

$('#clock').onclick = e => {
  e.stopPropagation();
  toggle('#cal', () => {
    const t = new Date(), y = t.getFullYear(), m = t.getMonth();
    const first = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
    let h = `<b>${t.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</b><div class="cg">` + 'LMMJVSD'.split('').map(x => `<i>${x}</i>`).join('');
    for (let i = 0; i < first; i++) h += '<i></i>';
    for (let d = 1; d <= days; d++) h += `<i class="${d === t.getDate() ? 'td' : ''}">${d}</i>`;
    $('#cal').innerHTML = h + '</div>';
  });
};

$('#qsb').onclick = e => {
  e.stopPropagation();
  toggle('#qs', () => {
    $('#qs').innerHTML = `<div class="tiles"></div><label>☀ <input type="range" id="br" min="40" max="100" value="${cfg.bright || 100}" aria-label="Luminosité"></label><label>🔊 <input type="range" aria-label="Volume"></label>`;
    [['Wi-Fi', 1], ['Bluetooth', 1], ['Mode avion', 0], ['Mode sombre', cfg.theme === 'dark']].forEach(([n, on], i) => {
      const b = document.createElement('button');
      b.className = 'tile' + (on ? ' on' : ''); b.textContent = n;
      b.onclick = () => {
        if (i === 3) { cfg.theme = cfg.theme === 'dark' ? 'light' : 'dark'; applyCfg(); }
        b.classList.toggle('on', i === 3 ? cfg.theme === 'dark' : undefined);
      };
      $('#qs .tiles').append(b);
    });
    $('#br').oninput = ev => { cfg.bright = +ev.target.value; applyCfg(); };
  });
};
const tick2 = () => { const t = new Date(); $('#clock').innerHTML = t.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '<br>' + t.toLocaleDateString('fr-FR'); };
tick2(); setInterval(tick2, 10000);
applyCfg();
