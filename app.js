const $ = s => document.querySelector(s);
const LS = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch (e) { return d } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} }
};
let fs = LS.get('fs', { 'Bienvenue.txt': 'Bienvenue sur Windows 11 Web !\nVos fichiers sont enregistrés dans ce navigateur.' });
const cfg = Object.assign({ theme: 'dark', wall: 0 }, LS.get('cfg', {}));
const WALLS = [
  'radial-gradient(60% 80% at 30% 70%,#0a5fd8 0,transparent 60%),radial-gradient(50% 60% at 70% 30%,#7b3fe4 0,transparent 60%),#0b1d4a',
  'radial-gradient(60% 80% at 70% 70%,#e0457b 0,transparent 60%),radial-gradient(50% 60% at 30% 30%,#ff9f43 0,transparent 60%),#3a0f33',
  'radial-gradient(70% 80% at 50% 80%,#12a085 0,transparent 60%),#06231f',
  'linear-gradient(135deg,#232526,#414345)'
];
function applyCfg() {
  document.body.dataset.theme = cfg.theme;
  document.body.style.setProperty('--wall', WALLS[cfg.wall]);
  LS.set('cfg', cfg);
}

const apps = {
  files: { t: 'Explorateur de fichiers', i: '📁', w: 560, h: 380, r: filesApp },
  notes: { t: 'Bloc-notes', i: '📝', w: 480, h: 360, r: notesApp },
  calc: { t: 'Calculatrice', i: '🧮', w: 280, h: 400, r: calcApp },
  web: { t: 'Navigateur', i: '🌐', w: 720, h: 480, r: webApp },
  set: { t: 'Paramètres', i: '⚙️', w: 420, h: 320, r: setApp }
};

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
  btn.textContent = a.i; btn.title = a.t;
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
const closeStart = () => $('#start').classList.add('hidden');
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
