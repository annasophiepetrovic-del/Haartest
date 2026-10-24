'use client';

import { useEffect, useState } from 'react';

// Annas WhatsApp-Nummer (Ländervorwahl + Nummer, nur Ziffern)
const WHATSAPP_NUMBER = '4915737732392';

const CSS = `
:root{
  --bg:#faf8fd; --surface:#ffffff; --fg:#2a2433; --muted:#6f6880; --line:#e6e0ef;
  --accent:#6d3fb2; --accent-strong:#58309a; --accent-soft:#f0e9fa; --on-accent:#ffffff;
  --warn-bg:#fff6dd; --warn-fg:#6b5200;
  --display:'Fraunces',Georgia,serif; --body:'Plus Jakarta Sans',system-ui,sans-serif;
}
@media (prefers-color-scheme:dark){:root{
  --bg:#17131e; --surface:#211b2b; --fg:#f0ecf6; --muted:#a79fb8; --line:#352d44;
  --accent:#b18df0; --accent-strong:#c7aaf6; --accent-soft:#2c2340; --on-accent:#1a1224;
  --warn-bg:#3a3012; --warn-fg:#f3dc8e; color-scheme:dark}}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--fg);font:16px/1.6 var(--body);
  padding:32px max(16px,env(safe-area-inset-right,0px)) 56px max(16px,env(safe-area-inset-left,0px))}
main{max-width:620px;margin:0 auto;display:flex;flex-direction:column;gap:20px}
.brand{font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--accent)}
h1,h2{font-family:var(--display);font-weight:500;line-height:1.2;text-wrap:balance;margin:0}
h1{font-size:clamp(28px,6vw,38px)} h2{font-size:clamp(22px,4.5vw,28px)}
h3{font-size:13px;letter-spacing:.07em;text-transform:uppercase;color:var(--accent);margin:0 0 6px;font-weight:600}
p{margin:0;max-width:65ch}
.card{background:var(--surface);border:1px solid var(--line);border-radius:24px;padding:28px;display:flex;flex-direction:column;gap:20px}
.muted{color:var(--muted);font-size:14px}
.btn{font:inherit;font-weight:600;border:0;border-radius:999px;padding:14px 26px;cursor:pointer;background:var(--accent);color:var(--on-accent);text-decoration:none;display:inline-block;text-align:center}
.btn:hover{background:var(--accent-strong)}
.btn.ghost{background:transparent;color:var(--accent);border:1.5px solid var(--line)}
.btn.ghost:hover{background:var(--accent-soft)}
.btn[disabled]{opacity:.4;cursor:not-allowed}
.btn[hidden]{display:none}
:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.row{display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:space-between}
.bar{height:6px;background:var(--line);border-radius:99px;overflow:hidden}
.bar i{display:block;height:100%;background:var(--accent);border-radius:99px;transition:width .3s}
.opts{display:flex;flex-direction:column;gap:10px}
.opt{font:inherit;text-align:left;background:var(--surface);color:var(--fg);border:1.5px solid var(--line);border-radius:16px;padding:14px 16px;cursor:pointer;display:flex;gap:12px;align-items:center}
.opt:hover{border-color:var(--accent)}
.opt .dot{flex:none;width:20px;height:20px;border:1.5px solid var(--muted);display:grid;place-items:center;font-size:12px;color:transparent}
.opt.multi .dot{border-radius:6px}.opt:not(.multi) .dot{border-radius:50%}
.opt[aria-pressed="true"]{border-color:var(--accent);background:var(--accent-soft)}
.opt[aria-pressed="true"] .dot{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}
input[type=text]{font:inherit;width:100%;padding:14px 16px;border-radius:16px;border:1.5px solid var(--line);background:var(--surface);color:var(--fg)}
.loader{display:flex;flex-direction:column;align-items:center;gap:18px;padding:40px 0;text-align:center}
.spin{width:44px;height:44px;border-radius:50%;border:4px solid var(--accent-soft);border-top-color:var(--accent);animation:sp 1s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.spin{animation-duration:3s}.bar i{transition:none}}
.steps{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px}
.steps li{display:flex;gap:12px}
.steps b{flex:none;width:26px;height:26px;border-radius:50%;background:var(--accent-soft);color:var(--accent);display:grid;place-items:center;font-size:13px}
.story{background:var(--accent-soft);border-radius:18px;padding:18px 20px}
.hint{background:var(--warn-bg);color:var(--warn-fg);border-radius:14px;padding:12px 16px;font-size:14px}
.cta{border-top:1px solid var(--line);padding-top:20px;display:flex;flex-direction:column;gap:12px;align-items:flex-start}
.err{color:var(--warn-fg);background:var(--warn-bg);border-radius:14px;padding:12px 16px;font-size:14px}
`;

/* Themen: A = dünner werdend, B = Länge/Bruch, C = matt/trocken */
const Q = [
  { id: 'nervt', t: 'Was nervt dich gerade am meisten an deinen Haaren?', multi: 1, o: [
    ['Mein Zopf wird immer dünner', { A: 2 }], ['Geheimratsecken oder ein breiterer Scheitel', { A: 2 }],
    ['Meine Haare brechen ab', { B: 2 }], ['Sie wachsen nicht mehr länger', { B: 2 }],
    ['Sie sind matt und glanzlos', { C: 2 }], ['Sie sind trocken und strohig', { C: 2 }],
    ['Es fehlt Fülle und Volumen', { A: 1, C: 1 }]] },
  { id: 'zopf', t: 'Wie ist dein Zopf im Vergleich zu vor ein paar Jahren?', o: [
    ['Deutlich dünner', { A: 3 }], ['Etwas dünner', { A: 2 }], ['Ungefähr gleich', {}], ['Eher dicker', {}]] },
  { id: 'kopfhaut', t: 'Siehst du an Schläfen oder Scheitel mehr Kopfhaut als früher?', multi: 1, o: [
    ['An den Schläfen', { A: 2 }], ['Am Scheitel', { A: 2 }], ['Am vorderen Haaransatz', { A: 2 }],
    ['Nein, eigentlich nicht', {}], ['Ich bin mir nicht sicher', { A: 1 }]] },
  { id: 'buerste', t: 'Wie viele Haare findest du in Bürste oder Abfluss?', o: [
    ['Kaum welche', {}], ['Ganz normal', {}], ['Deutlich mehr als früher', { A: 2, stark: 1 }],
    ['Büschelweise', { A: 3, stark: 2 }]] },
  { id: 'laenge', t: 'Bis zu welcher Länge wachsen deine Haare, bevor sie stehen bleiben?', o: [
    ['Bis zum Kinn oder zur Schulter', { B: 3 }], ['Bis auf die Schulterblätter', { B: 2 }],
    ['Bis zur Mitte des Rückens', { B: 1 }], ['Länge ist kein Problem, aber die Spitzen sind dünn', { B: 1 }],
    ['Das weiß ich nicht', {}]] },
  { id: 'hitze', t: 'Färbst, blondierst oder stylst du mit Hitze?', multi: 1, o: [
    ['Ich färbe', { C: 1, B: 1 }], ['Ich blondiere', { C: 2, B: 2 }], ['Glätteisen oder Lockenstab', { C: 2, B: 1 }],
    ['Ich föhne täglich heiß', { C: 1 }], ['Nichts davon', {}]] },
  { id: 'spitzen', t: 'Wie fühlen sich deine Spitzen an?', multi: 1, o: [
    ['Trocken und strohig', { C: 2 }], ['Gespalten', { B: 2 }], ['Dünn und ausgefranst', { B: 2, A: 1 }],
    ['Sie brechen schnell ab', { B: 2 }], ['Eigentlich ganz gut', {}]] },
  { id: 'traum', t: 'Was wäre dein Traum-Ergebnis in sechs Monaten?', multi: 1, o: [
    ['Ein dickerer Zopf', { A: 2 }], ['Ein dichterer Haaransatz', { A: 2 }], ['Mehr Länge', { B: 2 }],
    ['Weniger Haarausfall', { A: 2 }], ['Gesunde, kräftige Spitzen', { B: 1 }], ['Weiche, glänzende Haare', { C: 2 }]] },
];

const STORY = {
  A: 'Mit 38 hatte ich büschelweise Haare in der Hand, Geheimratsecken, einen ganz dünnen Zopf und Angst, eine Glatze zu bekommen.',
  B: 'Meine Haare sind früher nie über eine bestimmte Länge hinausgekommen und waren an den Spitzen immer wieder abgebrochen.',
  C: 'Meine Haare waren stumpf, trocken und ohne jede Fülle, auch durch Färben und Hitze.',
};
const OUTCOME =
  'Nach etwa sechs Monaten mit meiner neuen Pflegeroutine hatte ich rund 6 cm Babyhaare, einen dichteren Haaransatz, deutlich weniger Haarausfall und eine Länge, die ich vorher nie hatte. Heute, mit 43, habe ich volles, langes Haar.';
const SHORT = { A: 'dünner werdendes Haar', B: 'Länge und Bruch', C: 'matt und trocken' };

function scoring(ans) {
  const sc = { A: 0, B: 0, C: 0, stark: 0 };
  Q.forEach((q) => (ans[q.id] || []).forEach((i) => {
    const t = q.o[i][1];
    for (const k in t) sc[k] += t[k];
  }));
  const ranked = ['A', 'B', 'C'].sort((a, b) => sc[b] - sc[a]);
  const top = sc[ranked[0]] || 1;
  const themes = ranked.filter((k, i) => i === 0 || (sc[k] >= 3 && sc[k] >= top * 0.5));
  return { sc, themes, stark: sc.stark >= 2 || (ans.buerste || [])[0] === 3 };
}

function answersText(ans) {
  return Q.map((q) => `${q.t} ${(ans[q.id] || []).map((i) => q.o[i][0]).join(', ')}`);
}

function fallback(s, name) {
  const k = s.themes[0];
  const n = name ? name + ', ' : '';
  const H = {
    A: 'Deine Haare werden dünner und du willst deinen vollen Zopf zurück',
    B: 'Deine Haare brechen oder bleiben stehen und du willst endlich Länge',
    C: 'Deine Haare sind matt und trocken und du willst Fülle und Glanz zurück',
  }[k];
  const Sit = {
    A: 'Dein Zopf ist schmaler geworden und du siehst mehr Kopfhaut als früher. Das macht vielen Frauen ab 35 Sorgen. Oft liegt es auch an einer Kopfhaut, die zu wenig Aufmerksamkeit bekommt.',
    B: 'Deine Längen halten nicht mehr durch. Sie brechen ab, bevor sie richtig lang werden. Oft liegt es an strapazierten Spitzen, die schneller kaputtgehen, als das Haar nachwächst.',
    C: 'Deinen Haaren fehlen Feuchtigkeit und Fülle. Färben und Hitze können dazu beitragen, dass Längen und Spitzen stumpf wirken.',
  }[k];
  const St = {
    A: [['Kopfhaut und Basispflege', 'Starte mit Shampoo und Conditioner, die deine Kopfhaut in Ruhe lassen.'], ['Wachstumsserum', 'Danach kam bei mir das Serum für den Ansatz dazu.'], ['Rejuvabeads', 'Als Ergänzung, wenn du mehr dafür tun möchtest.']],
    B: [['Kopfhaut und Basispflege', 'Shampoo und Conditioner sind die Grundlage für alles Weitere.'], ['Rejuvabeads', 'Bei mir haben sie die Routine von innen ergänzt.'], ['Öl für Längen und Spitzen', 'Schützt, was schon gewachsen ist.']],
    C: [['Kopfhaut und Basispflege', 'Shampoo und Conditioner zuerst, damit alles andere besser wirkt.'], ['Öl für Längen und Spitzen', 'Gibt trockenen Längen wieder Geschmeidigkeit.'], ['Hitze reduzieren', 'Ein paar Tage ohne Glätteisen merkt man schon.']],
  }[k];
  return {
    headline: H,
    situation: n + Sit + (s.stark ? ' Wenn dein Haarausfall stark oder plötzlich ist, lass das bitte zusätzlich ärztlich abklären.' : ''),
    story: STORY[k] + ' ' + OUTCOME + ' Deshalb kenne ich genau das, was du gerade fühlst.',
    steps: St.map((x) => ({ titel: x[0], text: x[1] })),
    abschluss: 'Schreib mir auf WhatsApp, dann schauen wir gemeinsam, wo du anfangen kannst.',
  };
}

// Kennung aus der Adresse, z. B. ?quelle=haarausfall-nach-geburt. Nur Buchstaben, Ziffern, - und _.
function cleanQuelle(raw) {
  return String(raw || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 60);
}

function waMessage(result, ans, name, quelle) {
  const s = result.s;
  const lines = [`Hallo Anna, hier ist ${name || 'eine Leserin'}. Ich habe deinen Haar-Check gemacht.`];
  if (quelle) lines.push(`Ich komme von deinem Artikel: ${quelle}`);
  lines.push('', `Mein Hauptthema: ${result.headline}`);
  if (s.themes.length > 1) lines.push('Außerdem: ' + s.themes.slice(1).map((k) => SHORT[k]).join(', '));
  lines.push('', 'Meine Antworten:');
  Q.forEach((q) => lines.push(`• ${q.t.replace(/\?$/, '')}: ${(ans[q.id] || []).map((i) => q.o[i][0]).join(', ')}`));
  lines.push('', 'Ich freue mich auf deine Nachricht!');
  return lines.join('\n');
}

export default function Page() {
  const [step, setStep] = useState(-1); // -1 Start, 0..7 Fragen, 8 Name, 99 Laden, 100 Ergebnis
  const [ans, setAns] = useState({});
  const [name, setName] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [quelle, setQuelle] = useState('');

  useEffect(() => {
    try {
      setQuelle(cleanQuelle(new URLSearchParams(window.location.search).get('quelle')));
    } catch (e) {}
  }, []);

  async function analyze() {
    setStep(99);
    setError('');
    const s = scoring(ans);
    let r = null;
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, themes: s.themes, stark: s.stark, answers: answersText(ans) }),
      });
      if (!res.ok) throw new Error('api');
      r = await res.json();
    } catch (e) {
      r = null;
    }
    if (!r || !r.headline) r = fallback(s, name);
    setResult({ ...r, s });
    setStep(100);
  }

  function restart() {
    setAns({}); setName(''); setResult(null); setError(''); setCopied(''); setStep(-1);
  }

  function pick(q, i) {
    const cur = ans[q.id] || [];
    const next = q.multi ? (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]) : [i];
    setAns({ ...ans, [q.id]: next });
  }

  let view;
  if (step === -1) {
    view = (
      <>
        <div className="brand">Haar-Check mit Anna</div>
        <div className="card">
          <h1>Was drückt bei deinen Haaren gerade am meisten?</h1>
          <p>Ich hatte selbst alle drei Haarthemen: dünner werdendes Haar, Haare, die nicht länger wachsen, und matte, trockene Längen. In acht kurzen Fragen finden wir heraus, wo du gerade stehst. Danach bekommst du eine persönliche Einschätzung von mir.</p>
          <p className="muted">Dauert etwa zwei Minuten. Das ist keine medizinische Beratung, ich erzähle dir nur, wie es bei mir war.</p>
          <div><button className="btn" onClick={() => setStep(0)}>Los geht’s</button></div>
        </div>
      </>
    );
  } else if (step >= 0 && step < Q.length) {
    const q = Q[step];
    const sel = ans[q.id] || [];
    view = (
      <>
        <div className="brand">Haar-Check mit Anna</div>
        <div className="bar" role="progressbar" aria-valuenow={step + 1} aria-valuemax={Q.length + 1}>
          <i style={{ width: `${((step + 1) / (Q.length + 1)) * 100}%` }} />
        </div>
        <div className="card">
          <p className="muted">Frage {step + 1} von {Q.length}{q.multi ? ' · Mehrfachauswahl möglich' : ''}</p>
          <h2>{q.t}</h2>
          <div className="opts">
            {q.o.map((o, i) => (
              <button key={i} className={`opt ${q.multi ? 'multi' : ''}`} aria-pressed={sel.includes(i)} onClick={() => pick(q, i)}>
                <span className="dot">✓</span><span>{o[0]}</span>
              </button>
            ))}
          </div>
          <div className="row">
            <button className="btn ghost" hidden={step === 0} onClick={() => setStep(step - 1)}>Zurück</button>
            <button className="btn" disabled={!sel.length} onClick={() => setStep(step + 1)}>Weiter</button>
          </div>
        </div>
      </>
    );
  } else if (step === Q.length) {
    view = (
      <>
        <div className="brand">Haar-Check mit Anna</div>
        <div className="bar"><i style={{ width: '100%' }} /></div>
        <div className="card">
          <h2>Fast geschafft. Wie darf ich dich nennen?</h2>
          <p className="muted">Optional. Dein Vorname macht die Auswertung persönlicher.</p>
          <label htmlFor="nm" className="muted">Vorname</label>
          <input
            type="text" id="nm" autoComplete="given-name" maxLength={40} value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setName(name.trim()); analyze(); } }}
          />
          <div className="row">
            <button className="btn ghost" onClick={() => setStep(step - 1)}>Zurück</button>
            <button className="btn" onClick={() => { setName(name.trim()); analyze(); }}>Meine Auswertung ansehen</button>
          </div>
        </div>
      </>
    );
  } else if (step === 99) {
    view = (
      <>
        <div className="brand">Haar-Check mit Anna</div>
        <div className="card">
          <div className="loader" role="status">
            <div className="spin" />
            <h2>Ich schaue mir deine Antworten an{name ? ', ' + name : ''}</h2>
            <p className="muted">Deine persönliche Auswertung wird geschrieben. Das dauert ein paar Sekunden.</p>
          </div>
        </div>
      </>
    );
  } else if (result) {
    const r = result;
    const msg = waMessage(r, ans, name.trim(), quelle);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    view = (
      <>
        <div className="brand">Dein Haar-Check mit Anna</div>
        <div className="card">
          {error && <div className="err">{error}</div>}
          <h1>{r.headline}</h1>
          <section><h3>Was bei dir wahrscheinlich gerade los ist</h3><p>{r.situation}</p></section>
          <section className="story"><h3>Bei mir war es so</h3><p>{r.story}</p></section>
          <section>
            <h3>Hier würde ich an deiner Stelle anfangen</h3>
            <ol className="steps">
              {r.steps.map((s, i) => (
                <li key={i}><b>{i + 1}</b><span><strong>{s.titel}.</strong> {s.text}</span></li>
              ))}
            </ol>
          </section>
          {r.s.stark && <div className="hint">Bei starkem oder plötzlichem Haarausfall lohnt es sich, das zusätzlich ärztlich abklären zu lassen.</div>}
          <div className="cta">
            <p>{r.abschluss}</p>
            <a className="btn" href={url} target="_blank" rel="noopener noreferrer">Schick mir dein Ergebnis auf WhatsApp</a>
            <p className="muted">Du kannst mir gern ein aktuelles Foto deiner Haare mitschicken, dann kann ich besser einschätzen, wo du stehst.</p>
            <button
              className="btn ghost"
              onClick={async () => {
                try { await navigator.clipboard.writeText(msg); setCopied('Kopiert'); }
                catch (e) { setCopied('Kopieren nicht möglich'); }
              }}
            >{copied || 'Nachricht kopieren'}</button>
          </div>
        </div>
        <p className="muted">Das ist meine persönliche Erfahrung und keine medizinische Beratung.</p>
        <div><button className="btn ghost" onClick={restart}>Check neu starten</button></div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <main aria-live="polite">{view}</main>
    </>
  );
}
