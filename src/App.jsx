import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════════════ */
const C = {
  teal: "#00d4d4", tealD: "#00aaaa", tealDk: "#007a7a",
  coral: "#ff5f6d", coralD: "#e04450",
  amber: "#ffc851", amberD: "#e6b040",
  mint: "#43e97b", mintD: "#2ec464",
  violet: "#a78bfa", violetD: "#8b5cf6",
  navy: "#080f1e", navyM: "#0d1b30", navyL: "#132440",
  slate: "#3a5070", slateL: "#8aaac8",
  white: "#fff", off: "#f0fbfb",
  glass: "rgba(255,255,255,0.055)",
  glassBorder: "rgba(255,255,255,0.11)",
};

/* ═══════════════════════════════════════════════════════════════════
   SEED DATA
═══════════════════════════════════════════════════════════════════ */
const SEED_QUIZZES = [
  {
    id: "q1", title: "World Geography", category: "Geography", author: "Admin", authorId: "u0", difficulty: "medium",
    description: "Test your knowledge of countries, capitals and landmarks.",
    questions: [
      { text: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Brisbane"], correct: 2, hint: "It was chosen as a compromise between the two largest cities." },
      { text: "Which is the longest river in the world?", options: ["Amazon", "Yangtze", "Mississippi", "Nile"], correct: 3, hint: "It flows through northeastern Africa." },
      { text: "What country has the most natural lakes?", options: ["Russia", "USA", "Brazil", "Canada"], correct: 3, hint: "It's in North America." },
      { text: "Which desert is the largest in the world?", options: ["Sahara", "Gobi", "Arctic", "Arabian"], correct: 2, hint: "It's actually a cold desert." },
    ], ratings: [], plays: 14
  },
  {
    id: "q2", title: "Science Fundamentals", category: "Science", author: "Admin", authorId: "u0", difficulty: "easy",
    description: "Basic science questions for curious minds.",
    questions: [
      { text: "What is H₂O commonly known as?", options: ["Oxygen", "Hydrogen", "Water", "Salt"], correct: 2, hint: "You drink it every day." },
      { text: "How many bones are in the adult human body?", options: ["196", "206", "216", "226"], correct: 1, hint: "It's between 200 and 210." },
      { text: "What force keeps planets in orbit?", options: ["Magnetism", "Friction", "Gravity", "Inertia"], correct: 2, hint: "Same force that pulls apples from trees." },
    ], ratings: [{ userId: "u0", score: 5 }], plays: 22
  },
  {
    id: "q3", title: "Pop Culture Trivia", category: "Entertainment", author: "Admin", authorId: "u0", difficulty: "hard",
    description: "Music, movies, TV — how tuned in are you?",
    questions: [
      { text: "Which band released the album 'Dark Side of the Moon'?", options: ["Led Zeppelin", "Pink Floyd", "The Who", "Rush"], correct: 1, hint: "Named after a colour." },
      { text: "Who directed 'Inception' (2010)?", options: ["Steven Spielberg", "James Cameron", "Christopher Nolan", "Ridley Scott"], correct: 2, hint: "Also directed The Dark Knight." },
      { text: "In Friends, what is Joey's favourite food?", options: ["Pizza", "Tacos", "Sandwiches", "Lasagna"], correct: 3, hint: "He won't share it." },
    ], ratings: [{ userId: "u0", score: 4 }], plays: 9
  },
];

const SEED_USERS = [
  {
    id: "u0", name: "Admin", email: "admin@quiz.com", password: "admin",
    history: [], totalPoints: 0, avatar: "🦁"
  },
];

const DIFF_CONFIG = {
  easy: { label: "Easy", color: C.mint, time: 25, multiplier: 1, icon: "🟢" },
  medium: { label: "Medium", color: C.amber, time: 20, multiplier: 1.5, icon: "🟡" },
  hard: { label: "Hard", color: C.coral, time: 15, multiplier: 2, icon: "🔴" },
};
const AVATARS = ["🦁", "🐯", "🦊", "🐺", "🦅", "🐉", "🦋", "🐬", "🦄", "🤖", "👾", "🎭"];
const CATEGORIES = ["General", "Science", "Geography", "History", "Math", "Entertainment", "Technology", "Sports", "Art", "Other"];

/* ═══════════════════════════════════════════════════════════════════
   PARTICLE & CONFETTI HELPERS
═══════════════════════════════════════════════════════════════════ */
function spawnParticles(x, y, type = "correct") {
  const sets = {
    correct: ["✨", "⭐", "💫", "🌟", "🎉"],
    wrong: ["💥", "😬", "❌", "😅", "💢"],
    lifeline: ["🛡️", "💡", "✂️", "🌀"],
    points: ["💎", "⬆️", "🔥", "💰"],
  };
  const emojis = sets[type] || sets.correct;
  for (let i = 0; i < 6; i++) {
    const el = document.createElement("div");
    el.style.cssText = `position:fixed;z-index:9999;pointer-events:none;font-size:${1.2 + Math.random() * 0.8}rem;
      left:${x + (Math.random() - .5) * 100}px;top:${y + (Math.random() - .5) * 60}px;
      animation:pfloat ${1 + Math.random() * .6}s ease-out forwards;animation-delay:${i * .07}s`;
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }
}
function spawnConfetti(n = 80) {
  const cols = [C.teal, C.amber, C.mint, C.coral, C.violet, "#fff", "#ffd700"];
  for (let i = 0; i < n; i++) {
    const el = document.createElement("div");
    const size = 5 + Math.random() * 8;
    el.style.cssText = `position:fixed;z-index:9998;pointer-events:none;
      left:${Math.random() * 100}vw;top:-20px;
      width:${size}px;height:${size}px;border-radius:${Math.random() > 0.5 ? "50%" : "2px"};
      background:${cols[Math.floor(Math.random() * cols.length)]};
      animation:cfall ${1.5 + Math.random()}s ease-out forwards;
      animation-delay:${Math.random() * 1.2}s;
      transform:rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }
}
function spawnFloatingPoints(x, y, pts) {
  const el = document.createElement("div");
  el.style.cssText = `position:fixed;z-index:9999;pointer-events:none;
    left:${x}px;top:${y - 30}px;font-family:'Syne',sans-serif;font-weight:900;
    font-size:1.4rem;color:${C.amber};text-shadow:0 0 12px ${C.amber};
    animation:pfloat 1.3s ease-out forwards;`;
  el.textContent = `+${pts}`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

/* ═══════════════════════════════════════════════════════════════════
   ANIMATED CANVAS BACKGROUND
═══════════════════════════════════════════════════════════════════ */
function BgCanvas() {
  const ref = useRef();
  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext("2d");
    let W, H, raf;
    const dots = [];
    const resize = () => { W = cv.width = innerWidth; H = cv.height = innerHeight };
    resize(); window.addEventListener("resize", resize);
    for (let i = 0; i < 70; i++) dots.push({
      x: Math.random() * 2000, y: Math.random() * 1200,
      vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
      r: .8 + Math.random() * 2, o: .08 + Math.random() * .22
    });
    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H); t += .003;
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = W; if (d.x > W) d.x = 0;
        if (d.y < 0) d.y = H; if (d.y > H) d.y = 0;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,212,${d.o})`; ctx.fill();
      });
      for (let i = 0; i < dots.length; i++) for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(0,212,212,${.05 * (1 - dist / 100)})`; ctx.lineWidth = 1; ctx.stroke();
        }
      }
      const gx = W / 2 + Math.cos(t) * W * .28, gy = H / 2 + Math.sin(t * .7) * H * .22;
      [[gx, gy, 280, C.teal, .045], [W - gx, H - gy, 220, C.violet, .03], [W * .1, H * .8, 180, C.amber, .025]].forEach(([x, y, r, col, a]) => {
        ctx.save(); ctx.globalAlpha = a * 3;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, col + "44"); gr.addColorStop(1, "transparent");
        ctx.fillStyle = gr; ctx.fill(); ctx.restore();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize) };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

/* ═══════════════════════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
@keyframes pfloat{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-110px) scale(1.3)}}
@keyframes cfall{0%{opacity:1;transform:translateY(0) rotate(0deg)}100%{opacity:0;transform:translateY(220px) rotate(720deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
@keyframes popIn{0%{opacity:0;transform:scale(.82)}65%{transform:scale(1.04)}100%{opacity:1;transform:scale(1)}}
@keyframes slideIn{from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:translateX(0)}}
@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-9px)}40%{transform:translateX(9px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
@keyframes pulse2{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.92)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
@keyframes glow{0%,100%{box-shadow:0 0 8px rgba(0,212,212,.3)}50%{box-shadow:0 0 22px rgba(0,212,212,.7)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes heartbeat{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}
@keyframes streakAnim{0%{transform:scale(0) rotate(-10deg)}70%{transform:scale(1.15) rotate(2deg)}100%{transform:scale(1) rotate(0)}}
@keyframes progressWave{0%{background-position:0 0}100%{background-position:60px 0}}
@keyframes modalIn{from{opacity:0;transform:scale(.9) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes flashG{0%,100%{background:transparent}50%{background:rgba(67,233,123,.07)}}
@keyframes flashR{0%,100%{background:transparent}50%{background:rgba(255,95,109,.07)}}
@keyframes countUp{0%{transform:scale(.5);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes lbRow{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
@keyframes aiTyping{0%,80%,100%{opacity:0;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;cursor:default}
body{font-family:'Plus Jakarta Sans',sans-serif;background:${C.navy};color:#fff;overflow-x:hidden;min-height:100vh}

/* Shell */
#shell{position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column}

/* Nav */
.nav{display:flex;align-items:center;justify-content:space-between;padding:13px 28px;
  background:rgba(8,15,30,.75);backdrop-filter:blur(22px);
  border-bottom:1px solid rgba(0,212,212,.14);position:sticky;top:0;z-index:200}
.logo{font-family:'Syne',sans-serif;font-size:1.3rem;font-weight:900;cursor:pointer;
  background:linear-gradient(90deg,${C.teal},${C.amber});-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.nav-links{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.user-pill{display:flex;align-items:center;gap:7px;padding:5px 12px 5px 8px;
  background:rgba(0,212,212,.1);border:1px solid rgba(0,212,212,.2);border-radius:50px;
  font-size:.82rem;font-weight:600;color:${C.teal}}
.live-dot{width:7px;height:7px;border-radius:50%;background:${C.mint};
  box-shadow:0 0 6px ${C.mint};animation:pulse2 2s infinite}
.pts-chip{display:inline-flex;align-items:center;gap:4px;padding:5px 11px;border-radius:50px;
  background:rgba(255,200,81,.12);border:1px solid rgba(255,200,81,.22);
  color:${C.amber};font-size:.78rem;font-weight:700}

/* Page */
.page{flex:1;padding:38px 20px 80px;max-width:900px;margin:0 auto;width:100%}

/* Glass cards */
.glass{background:${C.glass};border:1px solid ${C.glassBorder};backdrop-filter:blur(18px);border-radius:18px;box-shadow:0 18px 55px rgba(0,0,0,.28)}
.glass-w{background:rgba(255,255,255,.93);border:1px solid rgba(255,255,255,.7);backdrop-filter:blur(18px);border-radius:18px;box-shadow:0 18px 55px rgba(0,0,0,.2);color:${C.navy}}

/* Buttons */
.btn{display:inline-flex;align-items:center;gap:7px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;
  font-size:.9rem;padding:11px 22px;border-radius:50px;border:none;cursor:pointer;
  transition:all .22s cubic-bezier(.34,1.56,.64,1);white-space:nowrap;position:relative;overflow:hidden}
.btn::after{content:'';position:absolute;inset:0;background:rgba(255,255,255,0);transition:background .18s;border-radius:inherit}
.btn:hover::after{background:rgba(255,255,255,.1)}
.btn:active{transform:scale(.95)!important}
.btn:disabled{opacity:.38;cursor:not-allowed;transform:none!important}
.btn-teal{background:linear-gradient(135deg,${C.teal},${C.tealD});color:#fff;box-shadow:0 4px 18px rgba(0,212,212,.3)}
.btn-teal:hover:not(:disabled){transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,212,212,.45)}
.btn-coral{background:linear-gradient(135deg,${C.coral},${C.coralD});color:#fff;box-shadow:0 4px 18px rgba(255,95,109,.3)}
.btn-coral:hover:not(:disabled){transform:translateY(-3px)}
.btn-amber{background:linear-gradient(135deg,${C.amber},${C.amberD});color:${C.navy};font-weight:800;box-shadow:0 4px 18px rgba(255,200,81,.3)}
.btn-amber:hover:not(:disabled){transform:translateY(-3px);box-shadow:0 8px 28px rgba(255,200,81,.45)}
.btn-mint{background:linear-gradient(135deg,${C.mint},${C.mintD});color:${C.navy};font-weight:800}
.btn-mint:hover:not(:disabled){transform:translateY(-3px)}
.btn-violet{background:linear-gradient(135deg,${C.violet},${C.violetD});color:#fff}
.btn-violet:hover:not(:disabled){transform:translateY(-3px)}
.btn-ghost{background:rgba(255,255,255,.07);color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.14)}
.btn-ghost:hover:not(:disabled){background:rgba(255,255,255,.13);transform:translateY(-2px)}
.btn-outline{background:transparent;color:${C.teal};border:2px solid ${C.teal}}
.btn-outline:hover:not(:disabled){background:${C.teal};color:#fff;transform:translateY(-2px)}
.btn-sm{padding:7px 15px;font-size:.78rem}
.btn-lg{padding:15px 34px;font-size:1rem}
.btn-icon{padding:9px 14px;border-radius:12px}

/* Inputs */
.inp{width:100%;padding:12px 15px;background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.13);
  border-radius:12px;color:#fff;font-family:'Plus Jakarta Sans',sans-serif;font-size:.93rem;outline:none;transition:all .2s}
.inp::placeholder{color:rgba(255,255,255,.28)}
.inp:focus{border-color:${C.teal};background:rgba(0,212,212,.08);box-shadow:0 0 0 3px rgba(0,212,212,.14)}
.inp-light{background:rgba(8,15,30,.06);border-color:rgba(8,15,30,.12);color:${C.navy}}
.inp-light::placeholder{color:rgba(8,15,30,.3)}
.inp-light:focus{border-color:${C.tealD};background:rgba(0,170,170,.06)}
.lbl{display:block;font-size:.76rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;
  color:rgba(255,255,255,.38);margin-bottom:5px}
.lbl-dark{color:rgba(8,15,30,.42)}
select.inp option{background:${C.navyM};color:#fff}

/* Progress bar */
.prog{height:5px;background:rgba(255,255,255,.09);border-radius:3px;overflow:hidden;margin-bottom:24px}
.prog-fill{height:100%;border-radius:3px;
  background:linear-gradient(90deg,${C.teal},${C.amber},${C.mint});background-size:200% 100%;
  animation:progressWave 2s linear infinite;transition:width .7s cubic-bezier(.65,0,.35,1)}

/* Timer ring */
.tring{position:relative;display:inline-flex;align-items:center;justify-content:center}
.tring svg{transform:rotate(-90deg)}
.tring-num{position:absolute;font-family:'Syne',sans-serif;font-size:.95rem;font-weight:900}

/* Option buttons */
.opt{display:flex;align-items:center;gap:13px;width:100%;padding:14px 18px;border-radius:14px;
  border:2px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);
  color:rgba(255,255,255,.82);font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:.95rem;
  cursor:pointer;text-align:left;transition:all .22s cubic-bezier(.34,1.56,.64,1);position:relative;overflow:hidden}
.opt::before{content:'';position:absolute;left:0;top:0;bottom:0;width:0;
  background:linear-gradient(90deg,rgba(0,212,212,.13),transparent);transition:width .3s;border-radius:inherit}
.opt:hover:not(:disabled)::before{width:100%}
.opt:hover:not(:disabled){border-color:${C.teal};transform:translateX(5px);color:#fff}
.opt.sel{border-color:${C.teal};background:rgba(0,212,212,.15);color:#fff}
.opt.correct{border-color:${C.mint}!important;background:rgba(67,233,123,.13)!important;color:${C.mint}!important;animation:glow .6s ease}
.opt.wrong{border-color:${C.coral}!important;background:rgba(255,95,109,.1)!important;color:${C.coral}!important}
.opt.elim{opacity:.3;cursor:not-allowed;text-decoration:line-through}
.opt:disabled{cursor:default}
.opt-lbl{width:33px;height:33px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  background:rgba(255,255,255,.1);color:rgba(255,255,255,.55);font-family:'Syne',sans-serif;
  font-size:.82rem;font-weight:900;flex-shrink:0;transition:all .22s}
.opt.sel .opt-lbl{background:${C.teal};color:#fff}
.opt.correct .opt-lbl{background:${C.mint};color:${C.navy}}
.opt.wrong .opt-lbl{background:${C.coral};color:#fff}

/* Badge */
.badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:50px;font-size:.73rem;font-weight:700}
.badge-teal{background:rgba(0,212,212,.13);color:${C.teal};border:1px solid rgba(0,212,212,.22)}
.badge-amber{background:rgba(255,200,81,.13);color:${C.amber};border:1px solid rgba(255,200,81,.22)}
.badge-coral{background:rgba(255,95,109,.13);color:${C.coral};border:1px solid rgba(255,95,109,.22)}
.badge-mint{background:rgba(67,233,123,.13);color:${C.mint};border:1px solid rgba(67,233,123,.22)}
.badge-violet{background:rgba(167,139,250,.13);color:${C.violet};border:1px solid rgba(167,139,250,.22)}
.badge-gray{background:rgba(255,255,255,.08);color:rgba(255,255,255,.45);border:1px solid rgba(255,255,255,.1)}

/* Quiz list item */
.qli{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:16px 20px;
  border-radius:16px;background:rgba(255,255,255,.045);border:1.5px solid rgba(255,255,255,.09);
  transition:all .22s ease;cursor:pointer}
.qli:hover{background:rgba(0,212,212,.07);border-color:rgba(0,212,212,.28);transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,0,0,.2)}

/* Streak */
.streak-badge{display:inline-flex;align-items:center;gap:5px;padding:5px 13px;border-radius:50px;
  background:linear-gradient(135deg,rgba(255,200,81,.18),rgba(255,95,109,.15));
  border:1px solid rgba(255,200,81,.35);color:${C.amber};font-weight:800;font-size:.82rem;
  animation:streakAnim .4s cubic-bezier(.34,1.56,.64,1) forwards}

/* Lives */
.heart{font-size:1.3rem;transition:all .3s;display:inline-block}
.heart.lost{opacity:.2;animation:heartbeat .3s ease;filter:grayscale(1)}

/* Lifeline btn */
.lifeline{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 14px;
  border-radius:14px;border:1.5px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);
  cursor:pointer;transition:all .22s;min-width:68px}
.lifeline:hover:not(:disabled){border-color:${C.teal};background:rgba(0,212,212,.1);transform:translateY(-2px)}
.lifeline:disabled{opacity:.25;cursor:not-allowed}
.lifeline-icon{font-size:1.4rem}
.lifeline-lbl{font-size:.65rem;font-weight:700;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.05em}

/* Score donut */
.donut-wrap{position:relative;display:inline-flex;align-items:center;justify-content:center}
.donut-wrap svg{position:absolute;inset:0}

/* Modal */
.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(8px);
  z-index:500;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{max-width:480px;width:100%;padding:32px 28px;animation:modalIn .35s ease forwards;max-height:90vh;overflow-y:auto}
.modal::-webkit-scrollbar{width:4px}.modal::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:2px}

/* Leaderboard */
.lb-row{display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);
  animation:lbRow .3s ease forwards;opacity:0}
.lb-rank{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-family:'Syne',sans-serif;font-size:.8rem;font-weight:900;flex-shrink:0}

/* AI generate */
.ai-thinking{display:flex;gap:5px;align-items:center}
.ai-dot{width:7px;height:7px;border-radius:50%;background:${C.teal};
  animation:aiTyping 1.2s ease-in-out infinite}
.ai-dot:nth-child(2){animation-delay:.2s}
.ai-dot:nth-child(3){animation-delay:.4s}

/* Star rating */
.star{font-size:1.5rem;cursor:pointer;transition:transform .15s;display:inline-block}
.star:hover{transform:scale(1.3)}

/* History row */
.hist-row{padding:12px 16px;border-radius:12px;background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:space-between;gap:10px}

/* Analytics bar */
.anly-bar-wrap{height:8px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden;flex:1}
.anly-bar-fill{height:100%;border-radius:4px;transition:width 1s ease}

/* Question type pill */
.qtype{display:flex;gap:8px;margin-bottom:14px}
.qtype-btn{padding:7px 16px;border-radius:50px;border:1.5px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.05);color:rgba(255,255,255,.5);font-size:.8rem;font-weight:700;cursor:pointer;transition:all .18s}
.qtype-btn.active{border-color:${C.teal};background:rgba(0,212,212,.12);color:${C.teal}}

/* Diff selector */
.diff-btn{padding:8px 18px;border-radius:50px;border:2px solid transparent;
  font-size:.82rem;font-weight:700;cursor:pointer;transition:all .22s;background:rgba(255,255,255,.05);color:rgba(255,255,255,.5)}
.diff-btn.active{color:#fff}

/* Tab bar */
.tabs{display:flex;gap:4px;background:rgba(255,255,255,.05);border-radius:12px;padding:4px;margin-bottom:24px}
.tab{flex:1;padding:9px 12px;border-radius:9px;border:none;background:transparent;
  color:rgba(255,255,255,.45);font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;
  font-size:.82rem;cursor:pointer;transition:all .2s;white-space:nowrap}
.tab.active{background:rgba(0,212,212,.18);color:${C.teal};box-shadow:0 2px 10px rgba(0,212,212,.15)}

/* Divider */
.div{height:1px;background:rgba(255,255,255,.08);margin:18px 0}

/* Misc layout */
.row{display:flex;align-items:center;gap:10px}
.row-sb{display:flex;align-items:center;justify-content:space-between;gap:10px}
.col{display:flex;flex-direction:column}
.g1{gap:5px}.g2{gap:10px}.g3{gap:15px}.g4{gap:22px}.g5{gap:30px}
.wrap{flex-wrap:wrap}
.center{text-align:center}
.w100{width:100%}
.mt1{margin-top:4px}.mt2{margin-top:10px}.mt3{margin-top:16px}.mt4{margin-top:24px}.mt5{margin-top:32px}.mt6{margin-top:44px}
.mb1{margin-bottom:4px}.mb2{margin-bottom:10px}.mb3{margin-bottom:16px}.mb4{margin-bottom:24px}
.afu{animation:fadeUp .4s ease forwards}.api{animation:popIn .38s ease forwards}
.s0{opacity:0}.s1{animation-delay:.06s;opacity:0}.s2{animation-delay:.12s;opacity:0}.s3{animation-delay:.18s;opacity:0}
.s4{animation-delay:.24s;opacity:0}.s5{animation-delay:.3s;opacity:0}.s6{animation-delay:.36s;opacity:0}
.sh{font-family:'Syne',sans-serif;font-weight:900;letter-spacing:-.5px}
.sh span{background:linear-gradient(90deg,${C.teal},${C.amber});-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.sub{color:rgba(255,255,255,.42);font-size:.9rem}
.glow-line{height:2px;border-radius:2px;background:linear-gradient(90deg,transparent,${C.teal},${C.amber},transparent);opacity:.4;margin:4px 0 26px}

/* Scrollbar */
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:rgba(255,255,255,.03)}
::-webkit-scrollbar-thumb{background:rgba(0,212,212,.2);border-radius:3px}

@media(max-width:600px){
  .nav{padding:11px 14px}.page{padding:24px 14px 60px}
  .btn-lg{padding:12px 24px;font-size:.9rem}
  .nav-links .btn-ghost{display:none}
}
`;

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════ */
function calcPoints(correct, timeLeft, maxTime, streak, multiplier) {
  if (!correct) return 0;
  const base = 100;
  const timeBonus = Math.floor((timeLeft / maxTime) * 50);
  const streakBonus = streak >= 3 ? 30 : streak >= 2 ? 15 : 0;
  return Math.floor((base + timeBonus + streakBonus) * multiplier);
}
function avgRating(ratings) {
  if (!ratings?.length) return 0;
  return (ratings.reduce((s, r) => s + r.score, 0) / ratings.length).toFixed(1);
}
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

/* ═══════════════════════════════════════════════════════════════════
   TIMER RING
═══════════════════════════════════════════════════════════════════ */
function TimerRing({ total, left, size = 56 }) {
  const r = (size - 8) / 2, circ = 2 * Math.PI * r, pct = left / total;
  const col = pct > .5 ? C.teal : pct > .25 ? C.amber : C.coral;
  return (
    <div className="tring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.09)" strokeWidth={5} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .95s linear,stroke .4s", filter: `drop-shadow(0 0 5px ${col})` }} />
      </svg>
      <span className="tring-num" style={{
        color: col, fontSize: left <= 5 ? "1rem" : ".9rem",
        animation: left <= 5 ? "pulse2 .6s infinite" : ""
      }}>{left}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SCORE DONUT
═══════════════════════════════════════════════════════════════════ */
function ScoreDonut({ score, total, pts, size = 170 }) {
  const pct = score / total, r = (size - 18) / 2, circ = 2 * Math.PI * r;
  const col = pct >= .8 ? C.mint : pct >= .6 ? C.teal : pct >= .4 ? C.amber : C.coral;
  const label = pct >= .8 ? "🏆 Legendary!" : pct >= .6 ? "🎉 Great Work!" : pct >= .4 ? "💪 Keep Going!" : "📚 Study More!";
  return (
    <div className="col g2" style={{ alignItems: "center" }}>
      <div className="donut-wrap" style={{ width: size, height: size }}>
        <div className="col" style={{ alignItems: "center", gap: 2, zIndex: 1 }}>
          <span className="sh" style={{ fontSize: "2.1rem", color: col, animation: "countUp .7s ease" }}>{Math.round(pct * 100)}%</span>
          <span style={{ color: "rgba(255,255,255,.35)", fontSize: ".72rem" }}>{score}/{total} correct</span>
          {pts > 0 && <span style={{ color: C.amber, fontSize: ".8rem", fontWeight: 700 }}>+{pts} pts</span>}
        </div>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={13} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={13}
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 1.6s cubic-bezier(.65,0,.35,1)",
              filter: `drop-shadow(0 0 10px ${col})`
            }} />
        </svg>
      </div>
      <span className="sh" style={{ fontSize: "1.05rem", color: col }}>{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STAR RATING
═══════════════════════════════════════════════════════════════════ */
function StarRating({ value, onChange, size = "1.5rem" }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="row g1">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className="star" style={{ fontSize: size, filter: (hover || value) >= i ? "none" : "grayscale(1)", opacity: (hover || value) >= i ? 1 : .4 }}
          onMouseEnter={() => onChange && setHover(i)} onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange && onChange(i)}>⭐</span>
      ))}
      {!onChange && <span style={{ color: "rgba(255,255,255,.4)", fontSize: ".8rem", fontWeight: 600 }}>({value})</span>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MODAL WRAPPER
═══════════════════════════════════════════════════════════════════ */
function Modal({ onClose, children }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal glass">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   AI GENERATE MODAL
═══════════════════════════════════════════════════════════════════ */
function AIGenerateModal({ onGenerated, onClose }) {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [diff, setDiff] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const generate = async () => {
    if (!topic.trim()) { setErr("Enter a topic first."); return }
    setLoading(true); setErr("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user", content: `Generate exactly ${count} multiple-choice quiz questions about: "${topic}".
Difficulty: ${diff}.
Return ONLY valid JSON, no markdown, no extra text:
{"title":"...","questions":[{"text":"question","options":["A","B","C","D"],"correct":0,"hint":"short hint"}]}
correct is 0-3 index. Make questions interesting and varied.`}]
        })
      });
      const data = await res.json();
      const text = data.content.map(b => b.text || "").join("").replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(text);
      onGenerated({ ...parsed, category: topic, difficulty: diff });
    } catch (e) { setErr("Generation failed. Try again.") }
    setLoading(false);
  };

  return (
    <Modal onClose={onClose}>
      <div className="row-sb mb4">
        <div>
          <div className="sh" style={{ fontSize: "1.3rem", color: "#fff" }}>🤖 AI Quiz Generator</div>
          <div className="sub mt1">Let Claude build your quiz instantly</div>
        </div>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>✕</button>
      </div>
      <label className="lbl">Topic or Subject</label>
      <input className="inp mb3" placeholder="e.g. Ancient Rome, JavaScript, Space..." value={topic} onChange={e => setTopic(e.target.value)} />
      <div className="row g3 mb3 wrap">
        <div style={{ flex: 1, minWidth: 100 }}>
          <label className="lbl">Questions</label>
          <select className="inp" value={count} onChange={e => setCount(+e.target.value)}>
            {[3, 5, 7, 10].map(n => <option key={n} value={n}>{n} questions</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 100 }}>
          <label className="lbl">Difficulty</label>
          <select className="inp" value={diff} onChange={e => setDiff(e.target.value)}>
            {Object.entries(DIFF_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
          </select>
        </div>
      </div>
      {err && <div style={{ color: C.coral, fontSize: ".82rem", fontWeight: 600, marginBottom: 10 }}>{err}</div>}
      {loading
        ? <div className="col g2" style={{ alignItems: "center", padding: "16px 0" }}>
          <div className="ai-thinking"><div className="ai-dot" /><div className="ai-dot" /><div className="ai-dot" /></div>
          <span className="sub" style={{ fontSize: ".82rem" }}>Claude is thinking…</span>
        </div>
        : <button className="btn btn-teal w100" style={{ justifyContent: "center" }} onClick={generate}>✨ Generate Quiz</button>
      }
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   AI EXPLAIN MODAL
═══════════════════════════════════════════════════════════════════ */
function AIExplainModal({ question, userAnswer, onClose }) {
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514", max_tokens: 1000,
            messages: [{
              role: "user", content: `Quiz question: "${question.text}"
Options: ${question.options.map((o, i) => `${["A", "B", "C", "D"][i]}) ${o}`).join(", ")}
Correct answer: ${question.options[question.correct]}
User answered: ${userAnswer != null && userAnswer >= 0 ? question.options[userAnswer] : "(timed out)"}

Give a clear, engaging 2-3 sentence explanation of why the correct answer is right and why the user's answer (if wrong) is incorrect. Be educational but fun. No headers, just plain text.`}]
          })
        });
        const data = await res.json();
        setExplanation(data.content.map(b => b.text || "").join(""));
      } catch { setExplanation("Could not fetch explanation. Please try again.") }
      setLoading(false);
    })();
  }, []);

  return (
    <Modal onClose={onClose}>
      <div className="row-sb mb4">
        <div className="sh" style={{ fontSize: "1.1rem", color: "#fff" }}>💡 AI Explanation</div>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>✕</button>
      </div>
      <div style={{ color: "rgba(255,255,255,.7)", fontSize: ".9rem", lineHeight: 1.6, marginBottom: 16 }}>{question.text}</div>
      <div className="div" />
      {loading
        ? <div className="row g2 mt2"><div className="ai-thinking"><div className="ai-dot" /><div className="ai-dot" /><div className="ai-dot" /></div><span className="sub">Explaining…</span></div>
        : <div style={{
          color: "rgba(255,255,255,.85)", fontSize: ".9rem", lineHeight: 1.7, padding: "14px 16px",
          background: "rgba(0,212,212,.07)", border: "1px solid rgba(0,212,212,.18)", borderRadius: 12
        }}>{explanation}</div>
      }
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   APP
═══════════════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(SEED_USERS);
  const [quizzes, setQuizzes] = useState(SEED_QUIZZES);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [result, setResult] = useState(null);

  const go = useCallback(p => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  const updateUser = useCallback((uid, fn) => {
    setUsers(prev => prev.map(u => u.id === uid ? fn(u) : u));
    setUser(prev => prev?.id === uid ? fn(prev) : prev);
  }, []);

  const rateQuiz = useCallback((qid, uid, score) => {
    setQuizzes(prev => prev.map(q => {
      if (q.id !== qid) return q;
      const ratings = q.ratings.filter(r => r.userId !== uid);
      return { ...q, ratings: [...ratings, { userId: uid, score }] };
    }));
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <BgCanvas />
      <div id="shell">
        <Nav user={user} onLogout={() => { setUser(null); go("home") }} onNav={go} />
        {page === "home" && <HomePage user={user} quizzes={quizzes} onNav={go} onStart={q => { setActiveQuiz(q); go("take") }} />}
        {page === "login" && <LoginPage users={users} onLogin={u => { setUser(u); go("home") }} onNav={go} />}
        {page === "register" && <RegisterPage users={users} onRegister={u => { setUsers(p => [...p, u]); setUser(u); go("home") }} onNav={go} />}
        {page === "list" && <ListPage quizzes={quizzes} user={user} onStart={q => { setActiveQuiz(q); go("take") }} onNav={go} onAddQuiz={q => setQuizzes(p => [...p, q])} />}
        {page === "create" && <CreatePage user={user} onSave={q => { setQuizzes(p => [...p, q]); go("list") }} onNav={go} />}
        {page === "take" && <TakePage quiz={activeQuiz} user={user} onFinish={r => {
          setResult(r);
          if (user) {
            updateUser(user.id, u => ({
              ...u,
              totalPoints: (u.totalPoints || 0) + r.totalPts,
              history: [{
                quizId: r.quiz.id, quizTitle: r.quiz.title, score: r.score, total: r.total,
                pts: r.totalPts, ts: Date.now()
              }, ...(u.history || [])].slice(0, 30)
            }));
            setQuizzes(prev => prev.map(q => q.id === activeQuiz.id ? { ...q, plays: (q.plays || 0) + 1 } : q));
          }
          go("result");
        }} onNav={go} />}
        {page === "result" && <ResultPage result={result} quiz={activeQuiz} user={user} onRate={rateQuiz} onNav={go} />}
        {page === "leaderboard" && <LeaderboardPage users={users} quizzes={quizzes} onNav={go} />}
        {page === "profile" && <ProfilePage user={user} quizzes={quizzes} onNav={go} />}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   NAV
═══════════════════════════════════════════════════════════════════ */
function Nav({ user, onLogout, onNav }) {
  return (
    <nav className="nav">
      <div className="logo" onClick={() => onNav("home")}>⚡ QuizMaker</div>
      <div className="nav-links">
        <button className="btn btn-ghost btn-sm" onClick={() => onNav("list")}>Browse</button>
        <button className="btn btn-ghost btn-sm" onClick={() => onNav("leaderboard")}>🏆 Board</button>
        {user ? (
          <>
            <div className="pts-chip">💎 {(user.totalPoints || 0).toLocaleString()}</div>
            <div className="user-pill" style={{ cursor: "pointer" }} onClick={() => onNav("profile")}>
              <div className="live-dot" />{user.avatar} {user.name}
            </div>
            <button className="btn btn-coral btn-sm" onClick={onLogout}>Out</button>
          </>
        ) : (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav("login")}>Login</button>
            <button className="btn btn-teal btn-sm" onClick={() => onNav("register")}>Sign Up</button>
          </>
        )}
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════════════ */
function HomePage({ user, quizzes, onNav, onStart }) {
  const featured = quizzes.slice(0, 3);
  return (
    <div className="page">
      {/* Hero */}
      <div style={{ padding: "65px 0 40px", textAlign: "center" }}>
        <span style={{ fontSize: "3.8rem", display: "block", animation: "float 4s ease-in-out infinite", marginBottom: 14 }}>🧠</span>
        <h1 className="sh afu" style={{ fontSize: "clamp(2rem,6vw,3.5rem)", color: "#fff", marginBottom: 14 }}>
          The Ultimate<br /><span>Quiz Platform</span>
        </h1>
        <p className="sub afu s2" style={{ maxWidth: 460, margin: "0 auto 32px", fontSize: ".98rem", lineHeight: 1.7 }}>
          AI-generated quizzes, live timers, streaks, lifelines & leaderboards — all in one place.
        </p>
        <div className="row afu s3" style={{ justifyContent: "center", flexWrap: "wrap", gap: 10 }}>
          {user
            ? <><button className="btn btn-teal btn-lg" onClick={() => onNav("create")}>✏️ Create Quiz</button>
              <button className="btn btn-amber btn-lg" onClick={() => onNav("list")}>📋 Browse All</button></>
            : <><button className="btn btn-teal btn-lg" onClick={() => onNav("register")}>🚀 Get Started Free</button>
              <button className="btn btn-ghost btn-lg" onClick={() => onNav("list")}>Browse Quizzes</button></>
          }
        </div>
      </div>

      {/* Stats row */}
      <div className="row afu s4" style={{ justifyContent: "center", gap: 32, flexWrap: "wrap", marginBottom: 40 }}>
        {[
          { v: quizzes.length, l: "Quizzes" },
          { v: quizzes.reduce((s, q) => s + (q.plays || 0), 0), l: "Plays" },
          { v: quizzes.reduce((s, q) => s + q.questions.length, 0), l: "Questions" },
        ].map(s => (
          <div key={s.l} className="col" style={{ alignItems: "center", gap: 2 }}>
            <span className="sh" style={{ fontSize: "1.8rem", color: C.teal }}>{s.v}</span>
            <span className="sub" style={{ fontSize: ".78rem" }}>{s.l}</span>
          </div>
        ))}
      </div>

      <div className="glow-line" />

      {/* Featured quizzes */}
      <div className="row-sb mb3 afu s4">
        <div className="sh" style={{ fontSize: "1.2rem", color: "#fff" }}>Featured Quizzes</div>
        <button className="btn btn-ghost btn-sm" onClick={() => onNav("list")}>See all →</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14, marginBottom: 36 }}>
        {featured.map((q, i) => {
          const d = DIFF_CONFIG[q.difficulty || "medium"];
          return (
            <div key={q.id} className={`glass afu s${i + 2}`} style={{
              padding: "20px 18px", cursor: "pointer",
              transition: "all .25s", borderTop: `3px solid ${d.color}`
            }}
              onClick={() => onStart(q)}>
              <div className="row-sb mb2">
                <span className={`badge badge-${q.difficulty === "easy" ? "mint" : q.difficulty === "hard" ? "coral" : "amber"}`}>
                  {d.icon} {d.label}
                </span>
                <span className="badge badge-gray">{q.plays || 0} plays</span>
              </div>
              <div className="sh" style={{ fontSize: "1rem", color: "#fff", marginBottom: 6 }}>{q.title}</div>
              <div style={{ color: "rgba(255,255,255,.38)", fontSize: ".8rem", marginBottom: 12, lineHeight: 1.5 }}>
                {q.description || "Test your knowledge!"}
              </div>
              <div className="row-sb">
                <div className="row g1">
                  <StarRating value={+avgRating(q.ratings)} />
                  <span style={{ color: "rgba(255,255,255,.3)", fontSize: ".75rem" }}>({q.ratings?.length || 0})</span>
                </div>
                <span style={{ color: "rgba(255,255,255,.3)", fontSize: ".78rem" }}>{q.questions.length}Q</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}>
        {[
          { i: "⏱️", t: "Timed Questions", d: "Live countdown with difficulty-based timers", c: C.amber, dl: ".05s" },
          { i: "🔥", t: "Streak System", d: "Build combos for bonus points multipliers", c: C.coral, dl: ".1s" },
          { i: "🛡️", t: "Lifelines", d: "50/50, hints and skips to survive hard questions", c: C.violet, dl: ".15s" },
          { i: "🤖", t: "AI Generation", d: "Claude generates full quizzes from any topic", c: C.teal, dl: ".2s" },
          { i: "💎", t: "Points & Ranks", d: "Earn points for speed, accuracy and streaks", c: C.mint, dl: ".25s" },
          { i: "📊", t: "Analytics", d: "Track accuracy, history and performance trends", c: C.amber, dl: ".3s" },
        ].map(f => (
          <div key={f.t} className="glass afu" style={{
            padding: "18px 16px", animationDelay: f.dl, opacity: 0,
            transition: "all .22s", borderBottom: `2px solid ${f.c}22`
          }}>
            <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>{f.i}</div>
            <div className="sh" style={{ fontSize: ".9rem", color: "#fff", marginBottom: 4 }}>{f.t}</div>
            <div style={{ color: "rgba(255,255,255,.35)", fontSize: ".78rem", lineHeight: 1.55 }}>{f.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════════════════════════ */
function LoginPage({ users, onLogin, onNav }) {
  const [f, setF] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(false);
  const sub = () => {
    const u = users.find(u => u.email === f.email && u.password === f.password);
    if (!u) { setErr("Invalid credentials."); setShake(true); setTimeout(() => setShake(false), 500); return }
    onLogin(u);
  };
  return (
    <div className="page"><div style={{ maxWidth: 400, margin: "50px auto" }} className={shake ? "shake" : ""}>
      <div className="glass api" style={{ padding: "34px 28px" }}>
        <div className="center mb4"><div style={{ fontSize: "2.4rem", marginBottom: 8 }}>👋</div>
          <div className="sh" style={{ fontSize: "1.4rem", color: "#fff" }}>Welcome back</div>
          <div className="sub mt1">Sign in to your account</div>
        </div>
        <label className="lbl">Email</label>
        <input className="inp mb2" type="email" value={f.email} onChange={e => setF(p => ({ ...p, email: e.target.value }))} />
        <label className="lbl">Password</label>
        <input className="inp" type="password" value={f.password} onChange={e => setF(p => ({ ...p, password: e.target.value }))} onKeyDown={e => e.key === "Enter" && sub()} />
        {err && <div style={{ color: C.coral, fontSize: ".82rem", fontWeight: 600, marginTop: 8 }}>{err}</div>}
        <button className="btn btn-teal w100 mt3" style={{ justifyContent: "center" }} onClick={sub}>Login →</button>
        <div className="center sub mt3" style={{ fontSize: ".82rem" }}>
          No account? <span style={{ color: C.teal, fontWeight: 700, cursor: "pointer" }} onClick={() => onNav("register")}>Sign up</span>
        </div>
        <div className="center" style={{ marginTop: 8, fontSize: ".72rem", color: "rgba(255,255,255,.2)" }}>Demo: admin@quiz.com / admin</div>
      </div>
    </div></div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   REGISTER
═══════════════════════════════════════════════════════════════════ */
function RegisterPage({ users, onRegister, onNav }) {
  const [f, setF] = useState({ name: "", email: "", password: "", avatar: "🦁" });
  const [err, setErr] = useState("");
  const sub = () => {
    if (!f.name || !f.email || !f.password) { setErr("All fields required."); return }
    if (users.find(u => u.email === f.email)) { setErr("Email already taken."); return }
    onRegister({ id: "u" + Date.now(), ...f, history: [], totalPoints: 0 });
  };
  return (
    <div className="page"><div style={{ maxWidth: 420, margin: "46px auto" }}>
      <div className="glass api" style={{ padding: "34px 28px" }}>
        <div className="center mb4"><div style={{ fontSize: "2.4rem", marginBottom: 8 }}>🎉</div>
          <div className="sh" style={{ fontSize: "1.4rem", color: "#fff" }}>Create Account</div>
          <div className="sub mt1">Choose your avatar and join</div>
        </div>
        <div className="mb3">
          <label className="lbl">Pick Avatar</label>
          <div className="row wrap g1">
            {AVATARS.map(a => (
              <span key={a} onClick={() => setF(p => ({ ...p, avatar: a }))} style={{
                fontSize: "1.6rem", cursor: "pointer",
                borderRadius: 8, padding: 4, background: f.avatar === a ? "rgba(0,212,212,.2)" : "transparent",
                transition: "all .18s", border: f.avatar === a ? `1.5px solid ${C.teal}` : "1.5px solid transparent"
              }}>{a}</span>
            ))}
          </div>
        </div>
        <label className="lbl">Name</label><input className="inp mb2" value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))} />
        <label className="lbl">Email</label><input className="inp mb2" type="email" value={f.email} onChange={e => setF(p => ({ ...p, email: e.target.value }))} />
        <label className="lbl">Password</label><input className="inp" type="password" value={f.password} onChange={e => setF(p => ({ ...p, password: e.target.value }))} />
        {err && <div style={{ color: C.coral, fontSize: ".82rem", fontWeight: 600, marginTop: 8 }}>{err}</div>}
        <button className="btn btn-teal w100 mt3" style={{ justifyContent: "center" }} onClick={sub}>Create Account 🚀</button>
        <div className="center sub mt3" style={{ fontSize: ".82rem" }}>
          Already a member? <span style={{ color: C.teal, fontWeight: 700, cursor: "pointer" }} onClick={() => onNav("login")}>Login</span>
        </div>
      </div>
    </div></div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   QUIZ LIST
═══════════════════════════════════════════════════════════════════ */
function ListPage({ quizzes, user, onStart, onNav, onAddQuiz }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [diff, setDiff] = useState("All");
  const [showAI, setShowAI] = useState(false);
  const cats = ["All", ...[...new Set(quizzes.map(q => q.category))]];

  const filtered = quizzes.filter(q => {
    const s = search.toLowerCase();
    if (s && !q.title.toLowerCase().includes(s) && !q.category?.toLowerCase().includes(s)) return false;
    if (cat !== "All" && q.category !== cat) return false;
    if (diff !== "All" && q.difficulty !== diff) return false;
    return true;
  });

  return (
    <div className="page">
      {showAI && <AIGenerateModal onGenerated={q => {
        const full = {
          id: "q" + Date.now(), author: user?.name || "AI", authorId: user?.id,
          description: `AI-generated quiz about ${q.title}`, plays: 0, ratings: [], ...q
        };
        setShowAI(false);
        if (onAddQuiz) onAddQuiz(full);
        onNav("list");
      }} onClose={() => setShowAI(false)} />}

      <div className="row-sb wrap mb4 g2">
        <div>
          <div className="sh afu" style={{ fontSize: "1.8rem", color: "#fff" }}>Browse Quizzes</div>
          <div className="sub afu s1">{quizzes.length} quizzes available</div>
        </div>
        <div className="row g2 wrap">
          {user && <button className="btn btn-violet btn-sm" onClick={() => setShowAI(true)}>🤖 AI Generate</button>}
          {user && <button className="btn btn-amber btn-sm" onClick={() => onNav("create")}>✏️ Create</button>}
        </div>
      </div>

      <input className="inp mb3" placeholder="🔍  Search quizzes…" value={search} onChange={e => setSearch(e.target.value)} />

      <div className="row wrap g1 mb2">
        {cats.slice(0, 7).map(c => (
          <button key={c} className={`diff-btn ${cat === c ? "active" : ""}`}
            style={cat === c ? { borderColor: C.teal, background: "rgba(0,212,212,.12)", color: C.teal } : {}}
            onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      <div className="row wrap g1 mb4">
        {["All", ...Object.keys(DIFF_CONFIG)].map(d => {
          const cfg = DIFF_CONFIG[d];
          return (
            <button key={d} className={`diff-btn ${diff === d ? "active" : ""}`}
              style={diff === d ? { borderColor: cfg?.color || C.teal, background: `${cfg?.color || C.teal}18`, color: cfg?.color || C.teal } : {}}
              onClick={() => setDiff(d)}>{cfg ? `${cfg.icon} ${cfg.label}` : d}</button>
          );
        })}
      </div>

      <div className="col g2">
        {filtered.length === 0 && <div className="center sub" style={{ padding: "50px 0" }}>No quizzes match your filters.</div>}
        {filtered.map((q, i) => {
          const d = DIFF_CONFIG[q.difficulty || "medium"];
          return (
            <div key={q.id} className={`qli afu`} style={{ animationDelay: `${i * .06}s`, opacity: 0 }}>
              <div className="col g1" style={{ flex: 1, minWidth: 0 }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>{q.title}</span>
                <div className="row wrap g1 mt1">
                  <span className={`badge badge-${q.difficulty === "easy" ? "mint" : q.difficulty === "hard" ? "coral" : "amber"}`}>{d.icon} {d.label}</span>
                  <span className="badge badge-teal">{q.category}</span>
                  <span className="badge badge-gray">{q.questions.length}Q · {q.plays || 0} plays</span>
                  {q.ratings?.length > 0 && <span className="badge badge-amber">⭐ {avgRating(q.ratings)}</span>}
                </div>
              </div>
              <button className="btn btn-teal btn-sm" onClick={() => onStart(q)}>Play →</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CREATE PAGE
═══════════════════════════════════════════════════════════════════ */
function CreatePage({ user, onSave, onNav }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [desc, setDesc] = useState("");
  const [diff, setDiff] = useState("medium");
  const [questions, setQuestions] = useState([emptyQ()]);
  const [err, setErr] = useState("");
  const [showAI, setShowAI] = useState(false);

  function emptyQ() { return { text: "", options: ["", "", "", ""], correct: 0, hint: "", type: "mcq" } }
  const addQ = () => setQuestions(p => [...p, emptyQ()]);
  const remQ = i => setQuestions(p => p.filter((_, x) => x !== i));
  const upQ = (i, f, v) => setQuestions(p => p.map((q, x) => x === i ? { ...q, [f]: v } : q));
  const upO = (qi, oi, v) => setQuestions(p => p.map((q, x) => x === qi ? { ...q, options: q.options.map((o, y) => y === oi ? v : o) } : q));
  const moveQ = (i, dir) => {
    setQuestions(p => { const a = [...p];[a[i], a[i + dir]] = [a[i + dir], a[i]]; return a });
  };

  const save = () => {
    if (!title.trim()) { setErr("Quiz title required."); return }
    if (!user) { setErr("Login required."); return }
    for (const q of questions) {
      if (!q.text.trim()) { setErr("All questions must have text."); return }
      if (q.type !== "tf" && q.options.some(o => !o.trim())) { setErr("Fill all answer options."); return }
    }
    onSave({
      id: "q" + Date.now(), title, category, description: desc, difficulty: diff,
      author: user.name, authorId: user.id, plays: 0, ratings: [], questions
    });
  };

  if (!user) return (
    <div className="page"><div className="glass api" style={{ maxWidth: 380, margin: "60px auto", padding: "36px", textAlign: "center" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔐</div>
      <div className="sh" style={{ fontSize: "1.3rem", color: "#fff", marginBottom: 8 }}>Login Required</div>
      <div className="sub mb4">Create an account to build quizzes.</div>
      <button className="btn btn-teal" onClick={() => onNav("login")}>Login →</button>
    </div></div>
  );

  return (
    <div className="page">
      {showAI && <AIGenerateModal onGenerated={q => {
        setTitle(q.title || "");
        setCategory(q.category || "General");
        setDiff(q.difficulty || "medium");
        setQuestions(q.questions.map(qq => ({ ...qq, hint: qq.hint || "", type: "mcq" })));
        setShowAI(false);
      }} onClose={() => setShowAI(false)} />}

      <div className="row-sb mb4 wrap g2">
        <div>
          <div className="sh afu" style={{ fontSize: "1.8rem", color: "#fff" }}>Create a Quiz</div>
          <div className="sub afu s1">Build your ultimate quiz</div>
        </div>
        <button className="btn btn-violet afu s2" onClick={() => setShowAI(true)}>🤖 AI Fill</button>
      </div>

      <div className="glass afu s2" style={{ padding: "22px 24px", marginBottom: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div><label className="lbl">Title *</label>
            <input className="inp" placeholder="Quiz title…" value={title} onChange={e => setTitle(e.target.value)} /></div>
          <div><label className="lbl">Category</label>
            <select className="inp" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select></div>
        </div>
        <div className="mb3"><label className="lbl">Description</label>
          <input className="inp" placeholder="Brief description…" value={desc} onChange={e => setDesc(e.target.value)} /></div>
        <div>
          <label className="lbl">Difficulty</label>
          <div className="row g2">
            {Object.entries(DIFF_CONFIG).map(([k, v]) => (
              <button key={k} className={`diff-btn ${diff === k ? "active" : ""}`}
                style={diff === k ? { borderColor: v.color, background: `${v.color}18`, color: v.color } : {}}
                onClick={() => setDiff(k)}>{v.icon} {v.label}</button>
            ))}
          </div>
        </div>
      </div>

      {questions.map((q, qi) => (
        <div key={qi} className="glass afu" style={{ padding: "18px 20px", marginBottom: 12, animationDelay: `${qi * .07}s`, opacity: 0, borderLeft: `3px solid ${C.teal}44` }}>
          <div className="row-sb mb2">
            <div className="row g2">
              <span style={{
                background: C.teal, color: C.navy, fontSize: ".72rem", fontWeight: 900,
                padding: "2px 9px", borderRadius: 50, fontFamily: "'Syne',sans-serif"
              }}>Q{qi + 1}</span>
              <div className="qtype">
                {[["mcq", "MCQ"], ["tf", "True/False"]].map(([t, l]) => (
                  <button key={t} className={`qtype-btn ${q.type === t ? "active" : ""}`}
                    onClick={() => upQ(qi, "type", t)}>{l}</button>
                ))}
              </div>
            </div>
            <div className="row g1">
              {qi > 0 && <button className="btn btn-ghost btn-sm btn-icon" onClick={() => moveQ(qi, -1)} title="Move up">↑</button>}
              {qi < questions.length - 1 && <button className="btn btn-ghost btn-sm btn-icon" onClick={() => moveQ(qi, 1)} title="Move down">↓</button>}
              {questions.length > 1 && <button className="btn btn-coral btn-sm" onClick={() => remQ(qi)}>Remove</button>}
            </div>
          </div>

          <input className="inp mb2" placeholder="Question text…" value={q.text} onChange={e => upQ(qi, "text", e.target.value)} />
          <input className="inp mb3" placeholder="💡 Hint (optional)…" value={q.hint} onChange={e => upQ(qi, "hint", e.target.value)}
            style={{ fontSize: ".84rem", background: "rgba(255,200,81,.05)", borderColor: "rgba(255,200,81,.15)" }} />

          {q.type === "tf" ? (
            <div className="row g2">
              {["True", "False"].map((opt, oi) => (
                <label key={oi} style={{
                  flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                  borderRadius: 10, border: `1.5px solid ${q.correct === oi ? "rgba(67,233,123,.4)" : "rgba(255,255,255,.1)"}`,
                  background: q.correct === oi ? "rgba(67,233,123,.08)" : "rgba(255,255,255,.04)", cursor: "pointer"
                }}>
                  <input type="radio" name={`tf-${qi}`} checked={q.correct === oi} onChange={() => upQ(qi, "correct", oi)} style={{ accentColor: C.mint }} />
                  <span style={{ color: q.correct === oi ? C.mint : "rgba(255,255,255,.7)", fontWeight: 600 }}>{opt}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="col g2">
              <label className="lbl">Options — radio marks correct answer</label>
              {q.options.map((opt, oi) => (
                <label key={oi} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10,
                  border: `1.5px solid ${q.correct === oi ? "rgba(67,233,123,.4)" : "rgba(255,255,255,.08)"}`,
                  background: q.correct === oi ? "rgba(67,233,123,.07)" : "rgba(255,255,255,.03)", cursor: "pointer"
                }}>
                  <input type="radio" name={`c-${qi}`} checked={q.correct === oi} onChange={() => upQ(qi, "correct", oi)} style={{ accentColor: C.mint, flexShrink: 0 }} />
                  <input className="inp" style={{
                    flex: 1, padding: "7px 10px", fontSize: ".88rem",
                    borderColor: q.correct === oi ? "rgba(67,233,123,.3)" : "rgba(255,255,255,.1)"
                  }}
                    placeholder={`Option ${["A", "B", "C", "D"][oi]}`} value={opt} onChange={e => upO(qi, oi, e.target.value)} />
                  {q.correct === oi && <span style={{ color: C.mint, fontSize: ".75rem", fontWeight: 700, whiteSpace: "nowrap" }}>✓ Correct</span>}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}

      <button className="btn btn-ghost w100 mt2" onClick={addQ} style={{ justifyContent: "center" }}>+ Add Question</button>
      {err && <div style={{ color: C.coral, fontWeight: 600, marginTop: 10, fontSize: ".85rem" }}>{err}</div>}
      <div className="row-sb mt4 wrap g2">
        <button className="btn btn-ghost" onClick={() => onNav("list")}>← Cancel</button>
        <button className="btn btn-amber" onClick={save}>Publish Quiz 🚀</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAKE PAGE
═══════════════════════════════════════════════════════════════════ */
function TakePage({ quiz, user, onFinish, onNav }) {
  const cfg = DIFF_CONFIG[quiz?.difficulty || "medium"];
  const QTIME = cfg.time;

  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(QTIME);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [totalPts, setTotalPts] = useState(0);
  const [lifelines, setLifelines] = useState({ fifty: true, hint: true, skip: true });
  const [eliminated, setEliminated] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [flashCls, setFlashCls] = useState("");
  const [key, setKey] = useState(0);
  const [explainQ, setExplainQ] = useState(null);
  const timerRef = useRef();
  const handleAnswerRef = useRef();

  useEffect(() => { if (!quiz) onNav("list") }, [quiz, onNav]);
  if (!quiz) return null;
  const q = quiz.questions[cur];
  const total = quiz.questions.length;
  const isTF = q.options.length === 2 || (q.type === "tf");

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setTimeLeft(QTIME);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleAnswerRef.current(-1); return 0 }
        return t - 1;
      });
    }, 1000);
  }, [cur]);

  useEffect(() => { startTimer(); }, [cur]);
  useEffect(() => () => clearInterval(timerRef.current), []);

  const handleAnswer = useCallback((i) => {
    if (answered) return;
    clearInterval(timerRef.current);
    setSel(i); setAnswered(true);
    const ok = i === q.correct;
    const pts = calcPoints(ok, timeLeft, QTIME, streak, cfg.multiplier);
    if (ok) {
      setStreak(s => s + 1); setTotalPts(p => p + pts);
      setFlashCls("flashG"); spawnParticles(window.innerWidth / 2, window.innerHeight / 2, "correct");
      if (pts > 0) setTimeout(() => spawnFloatingPoints(window.innerWidth / 2 - 30, window.innerHeight * .4, pts), 100);
    } else {
      setStreak(0);
      if (i !== -1) setLives(l => { const nl = l - 1; return nl });
      setFlashCls("flashR"); spawnParticles(window.innerWidth / 2, window.innerHeight / 2, "wrong");
    }
    setAnswers(p => [...p, { selected: i, correct: q.correct, pts: ok ? pts : 0, timeLeft }]);
    setTimeout(() => setFlashCls(""), 700);
  }, [answered, q, timeLeft, streak, cfg.multiplier]);

  useEffect(() => { handleAnswerRef.current = handleAnswer }, [handleAnswer]);

  const next = () => {
    if (cur + 1 >= total || lives <= 0) {
      spawnConfetti(80);
      onFinish({
        score: answers.filter(a => a.selected === a.correct).length + (sel === q.correct ? 1 : 0),
        total, quiz, answers: [...answers], totalPts, streak
      });
      return;
    }
    setCur(c => c + 1); setSel(null); setAnswered(false); setEliminated([]); setShowHint(false); setKey(k => k + 1);
  };

  const useFifty = () => {
    if (!lifelines.fifty) return;
    setLifelines(p => ({ ...p, fifty: false }));
    const wrong = q.options.map((_, i) => i).filter(i => i !== q.correct);
    const toElim = [wrong[Math.floor(Math.random() * wrong.length)]];
    let second = wrong.filter(x => x !== toElim[0]);
    toElim.push(second[Math.floor(Math.random() * second.length)]);
    setEliminated(toElim);
    spawnParticles(window.innerWidth / 2, window.innerHeight / 2, "lifeline");
  };
  const useHint = () => {
    if (!lifelines.hint || !q.hint) return;
    setLifelines(p => ({ ...p, hint: false })); setShowHint(true);
    spawnParticles(window.innerWidth / 2, window.innerHeight / 2, "lifeline");
  };
  const useSkip = () => {
    if (!lifelines.skip) return;
    setLifelines(p => ({ ...p, skip: false }));
    setAnswers(p => [...p, { selected: -2, correct: q.correct, pts: 0, timeLeft, skipped: true }]);
    setAnswered(true); setSel(-2);
  };

  const optCls = (i) => {
    if (eliminated.includes(i)) return "elim";
    if (!answered) return sel === i ? "sel" : "";
    if (i === q.correct) return "correct";
    if (i === sel && sel !== q.correct) return "wrong";
    return "";
  };

  const displayOptions = isTF ? ["True", "False"] : q.options;

  return (
    <div className="page" style={{ animation: flashCls === "flashG" ? "flashG .6s ease" : flashCls === "flashR" ? "flashR .6s ease" : "none" }}>
      {explainQ && <AIExplainModal question={explainQ.q} userAnswer={explainQ.sel} onClose={() => setExplainQ(null)} />}

      {/* Top HUD */}
      <div className="row-sb wrap mb2 g2">
        <div className="row g2 wrap">
          <span className="badge badge-teal">{quiz.title}</span>
          <span className={`badge badge-${quiz.difficulty === "easy" ? "mint" : quiz.difficulty === "hard" ? "coral" : "amber"}`}>
            {cfg.icon} {cfg.label}
          </span>
          {streak >= 2 && <div className="streak-badge" key={streak}>🔥 {streak}× streak!</div>}
        </div>
        <div className="row g2 wrap">
          <div className="pts-chip">💎 {totalPts}</div>
          <TimerRing total={QTIME} left={timeLeft} />
        </div>
      </div>

      {/* Lives */}
      <div className="row-sb mb2">
        <div className="row g1">
          {[0, 1, 2].map(i => (
            <span key={i} className={`heart ${i >= lives ? "lost" : ""}`}>❤️</span>
          ))}
        </div>
        <span style={{ color: "rgba(255,255,255,.35)", fontSize: ".82rem", fontWeight: 600 }}>{cur + 1} / {total}</span>
      </div>

      {/* Progress */}
      <div className="prog"><div className="prog-fill" style={{ width: `${(cur / total) * 100}%` }} /></div>

      {/* Question card */}
      <div className="glass api" key={key} style={{ padding: "28px 24px", marginBottom: 14 }}>
        {showHint && (
          <div style={{
            background: "rgba(255,200,81,.1)", border: "1px solid rgba(255,200,81,.25)",
            borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: ".85rem", color: C.amber, fontWeight: 600
          }}>
            💡 {q.hint}
          </div>
        )}
        <p className="sh" style={{ fontSize: "clamp(.95rem,3vw,1.15rem)", color: "#fff", lineHeight: 1.55, marginBottom: 22, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700 }}>
          {q.text}
        </p>

        <div className="col g2">
          {displayOptions.map((opt, i) => (
            <button key={i} className={`opt ${optCls(i)}`}
              onClick={() => { if (!eliminated.includes(i)) handleAnswer(i) }} disabled={answered}>
              <span className="opt-lbl">{isTF ? (i === 0 ? "T" : "F") : ["A", "B", "C", "D"][i]}</span>
              <span style={{ flex: 1 }}>{opt}</span>
              {answered && i === q.correct && <span style={{ fontSize: "1.05rem" }}>✓</span>}
              {answered && i === sel && sel !== q.correct && i !== q.correct && <span style={{ fontSize: "1.05rem" }}>✗</span>}
            </button>
          ))}
        </div>

        {answered && sel !== -2 && (
          <div className="afu" style={{
            marginTop: 16,
            background: sel === q.correct ? "rgba(67,233,123,.09)" : "rgba(255,95,109,.09)",
            border: `1px solid ${sel === q.correct ? "rgba(67,233,123,.28)" : "rgba(255,95,109,.28)"}`,
            borderRadius: 12, padding: "12px 16px"
          }}>
            <div className="row-sb wrap g2">
              <span style={{ fontWeight: 700, color: sel === q.correct ? C.mint : C.coral, fontSize: ".9rem" }}>
                {sel === -1 ? `⏰ Time's up! Correct: ${displayOptions[q.correct]}`
                  : sel === q.correct ? `🎉 +${answers[answers.length - 1]?.pts || 0} pts${streak >= 2 ? ` (×${streak} streak!)` : ""}!`
                    : `❌ Correct: ${displayOptions[q.correct]}`}
              </span>
              <button className="btn btn-ghost btn-sm" style={{ fontSize: ".72rem" }}
                onClick={() => setExplainQ({ q, sel })}>🤖 Explain</button>
            </div>
          </div>
        )}
        {answered && sel === -2 && (
          <div className="afu" style={{
            marginTop: 16, background: "rgba(167,139,250,.1)",
            border: "1px solid rgba(167,139,250,.25)", borderRadius: 12, padding: "12px 16px"
          }}>
            <span style={{ color: C.violet, fontWeight: 700 }}>⏭ Skipped — correct was: {displayOptions[q.correct]}</span>
          </div>
        )}
      </div>

      {/* Lifelines */}
      {!answered && (
        <div className="row g2 mb3 wrap">
          <button className="lifeline" disabled={!lifelines.fifty || isTF} onClick={useFifty}>
            <span className="lifeline-icon">✂️</span><span className="lifeline-lbl">50/50</span>
          </button>
          <button className="lifeline" disabled={!lifelines.hint || !q.hint} onClick={useHint}>
            <span className="lifeline-icon">💡</span><span className="lifeline-lbl">Hint</span>
          </button>
          <button className="lifeline" disabled={!lifelines.skip} onClick={useSkip}>
            <span className="lifeline-icon">⏭</span><span className="lifeline-lbl">Skip</span>
          </button>
        </div>
      )}

      {answered && (
        <div className="afu" style={{ textAlign: "right" }}>
          <button className="btn btn-teal" onClick={next}>
            {cur + 1 >= total || lives <= 0 ? "See Results 🏆" : "Next →"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   RESULT PAGE
═══════════════════════════════════════════════════════════════════ */
function ResultPage({ result, quiz, user, onRate, onNav }) {
  const [tab, setTab] = useState("review");
  const [myRating, setMyRating] = useState(0);
  const [explainQ, setExplainQ] = useState(null);
  const [ratingDone, setRatingDone] = useState(false);

  useEffect(() => { if (!result) onNav("home") }, [result, onNav]);
  if (!result) return null;
  const { score, total, answers, totalPts } = result;

  const submitRating = (s) => {
    setMyRating(s);
    if (user) onRate(quiz.id, user.id, s);
    setRatingDone(true);
    spawnParticles(window.innerWidth / 2, window.innerHeight / 2, "points");
  };

  return (
    <div className="page">
      {explainQ && <AIExplainModal question={explainQ.q} userAnswer={explainQ.sel} onClose={() => setExplainQ(null)} />}

      {/* Score card */}
      <div className="glass api" style={{ padding: "32px 24px", maxWidth: 500, margin: "0 auto 24px", textAlign: "center" }}>
        <ScoreDonut score={score} total={total} pts={totalPts} />
        <div className="div" />

        {/* Rate quiz */}
        {!ratingDone && user ? (
          <div className="col g2" style={{ alignItems: "center", marginBottom: 16 }}>
            <span style={{ color: "rgba(255,255,255,.5)", fontSize: ".82rem", fontWeight: 600 }}>Rate this quiz</span>
            <StarRating value={myRating} onChange={submitRating} />
          </div>
        ) : ratingDone ? (
          <div style={{ color: C.amber, fontWeight: 700, marginBottom: 16, fontSize: ".9rem" }}>⭐ Thanks for rating!</div>
        ) : null}

        <div className="row g2" style={{ justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-teal" onClick={() => onNav("list")}>Browse More</button>
          <button className="btn btn-amber" onClick={() => onNav("leaderboard")}>🏆 Leaderboard</button>
          <button className="btn btn-ghost" onClick={() => onNav("home")}>Home</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === "review" ? "active" : ""}`} onClick={() => setTab("review")}>📋 Answer Review</button>
        <button className={`tab ${tab === "stats" ? "active" : ""}`} onClick={() => setTab("stats")}>📊 Stats</button>
      </div>

      {tab === "review" && (
        <div className="col g2">
          {quiz.questions.map((q, i) => {
            const a = answers[i]; const ok = a?.selected === q.correct; const timedOut = a?.selected === -1; const skipped = a?.selected === -2;
            const displayOpts = q.options;
            return (
              <div key={i} className="glass afu" style={{
                padding: "16px 20px", animationDelay: `${i * .06}s`, opacity: 0,
                borderLeft: `3px solid ${ok ? C.mint : C.coral}`
              }}>
                <div className="row g2 mb1 wrap">
                  <span style={{ color: "rgba(255,255,255,.3)", fontWeight: 700, fontSize: ".78rem" }}>Q{i + 1}</span>
                  <span className={`badge badge-${ok ? "mint" : timedOut ? "amber" : skipped ? "violet" : "coral"}`}>
                    {ok ? "✓ Correct" : timedOut ? "⏰ Time's Up" : skipped ? "⏭ Skipped" : "✗ Wrong"}
                  </span>
                  {a?.pts > 0 && <span className="badge badge-amber">+{a.pts}pts</span>}
                  {a?.timeLeft != null && a.timeLeft > 0 && <span className="badge badge-gray">⏱ {a.timeLeft}s left</span>}
                </div>
                <p style={{ color: "rgba(255,255,255,.82)", fontWeight: 600, marginBottom: ok ? 4 : 8, fontSize: ".9rem" }}>{q.text}</p>
                {!ok && !skipped && (
                  <div style={{ fontSize: ".82rem", color: "rgba(255,255,255,.38)" }}>
                    {!timedOut && a?.selected >= 0 && <>Your: <b style={{ color: C.coral }}>{displayOpts[a.selected]}</b> · </>}
                    Correct: <b style={{ color: C.mint }}>{displayOpts[q.correct]}</b>
                  </div>
                )}
                <button className="btn btn-ghost btn-sm mt2" style={{ fontSize: ".72rem", padding: "5px 12px" }}
                  onClick={() => setExplainQ({ q, sel: a?.selected })}>🤖 AI Explain</button>
              </div>
            );
          })}
        </div>
      )}

      {tab === "stats" && (
        <div className="glass afu" style={{ padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 14, marginBottom: 20 }}>
            {[
              { l: "Accuracy", v: `${Math.round(score / total * 100)}%`, c: score / total >= .6 ? C.mint : C.coral },
              { l: "Points Earned", v: totalPts, c: C.amber },
              { l: "Best Streak", v: `${result.streak || 0}×`, c: C.coral },
              { l: "Questions", v: `${score}/${total}`, c: C.teal },
            ].map(s => (
              <div key={s.l} style={{ textAlign: "center", padding: "14px 10px", background: "rgba(255,255,255,.04)", borderRadius: 12 }}>
                <div className="sh" style={{ fontSize: "1.6rem", color: s.c }}>{s.v}</div>
                <div style={{ color: "rgba(255,255,255,.35)", fontSize: ".75rem", marginTop: 3 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "rgba(255,255,255,.55)", fontSize: ".8rem", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".06em" }}>Time per question</div>
            {quiz.questions.map((q, i) => {
              const a = answers[i]; const tl = a?.timeLeft || 0; const pct = (tl / DIFF_CONFIG[quiz.difficulty || "medium"].time) * 100;
              return (
                <div key={i} className="row g2 mb2" style={{ alignItems: "center" }}>
                  <span style={{ color: "rgba(255,255,255,.35)", fontSize: ".75rem", width: 22 }}>Q{i + 1}</span>
                  <div className="anly-bar-wrap">
                    <div className="anly-bar-fill" style={{ width: `${pct}%`, background: a?.selected === q.correct ? C.mint : C.coral }} />
                  </div>
                  <span style={{ color: "rgba(255,255,255,.35)", fontSize: ".75rem", width: 32, textAlign: "right" }}>{tl}s</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LEADERBOARD PAGE
═══════════════════════════════════════════════════════════════════ */
function LeaderboardPage({ users, quizzes, onNav }) {
  const [tab, setTab] = useState("global");
  const sorted = [...users].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
  const rankColors = ["#ffd700", "#c0c0c0", "#cd7f32"];
  const rankBg = ["rgba(255,215,0,.15)", "rgba(192,192,192,.1)", "rgba(205,127,50,.1)"];

  return (
    <div className="page">
      <div className="row-sb mb4 wrap">
        <div>
          <div className="sh afu" style={{ fontSize: "1.8rem", color: "#fff" }}>🏆 Leaderboard</div>
          <div className="sub afu s1">Top players across all quizzes</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => onNav("list")}>← Browse Quizzes</button>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === "global" ? "active" : ""}`} onClick={() => setTab("global")}>🌍 Global Rankings</button>
        <button className={`tab ${tab === "quizzes" ? "active" : ""}`} onClick={() => setTab("quizzes")}>📋 Top Quizzes</button>
      </div>

      {tab === "global" && (
        <div className="col g2">
          {sorted.map((u, i) => (
            <div key={u.id} className="lb-row" style={{
              animationDelay: `${i * .07}s`,
              background: i < 3 ? rankBg[i] : "rgba(255,255,255,.04)",
              borderColor: i < 3 ? `${rankColors[i]}30` : "rgba(255,255,255,.08)"
            }}>
              <div className="lb-rank" style={{
                background: i < 3 ? rankColors[i] : "rgba(255,255,255,.1)",
                color: i < 3 ? C.navy : "rgba(255,255,255,.5)"
              }}>
                {i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
              </div>
              <span style={{ fontSize: "1.5rem" }}>{u.avatar || "🧑"}</span>
              <div className="col g1" style={{ flex: 1 }}>
                <span style={{ color: "#fff", fontWeight: 700 }}>{u.name}</span>
                <span style={{ color: "rgba(255,255,255,.35)", fontSize: ".76rem" }}>{(u.history || []).length} quizzes played</span>
              </div>
              <div className="col g1" style={{ alignItems: "flex-end" }}>
                <span className="sh" style={{ fontSize: "1.15rem", color: i < 3 ? rankColors[i] : C.teal }}>{(u.totalPoints || 0).toLocaleString()}</span>
                <span style={{ color: "rgba(255,255,255,.3)", fontSize: ".72rem" }}>points</span>
              </div>
            </div>
          ))}
          {sorted.length === 0 && <div className="center sub" style={{ padding: "40px 0" }}>No players yet. Be the first!</div>}
        </div>
      )}

      {tab === "quizzes" && (
        <div className="col g2">
          {[...quizzes].sort((a, b) => (b.plays || 0) - (a.plays || 0)).map((q, i) => {
            const d = DIFF_CONFIG[q.difficulty || "medium"];
            return (
              <div key={q.id} className="lb-row" style={{ animationDelay: `${i * .06}s` }}>
                <div className="lb-rank" style={{ background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.4)" }}>{i + 1}</div>
                <div className="col g1" style={{ flex: 1 }}>
                  <span style={{ color: "#fff", fontWeight: 700 }}>{q.title}</span>
                  <div className="row g1 mt1">
                    <span className="badge badge-gray">{q.category}</span>
                    <span className={`badge badge-${q.difficulty === "easy" ? "mint" : q.difficulty === "hard" ? "coral" : "amber"}`}>{d.icon} {d.label}</span>
                    {q.ratings?.length > 0 && <span className="badge badge-amber">⭐ {avgRating(q.ratings)}</span>}
                  </div>
                </div>
                <div className="col g1" style={{ alignItems: "flex-end" }}>
                  <span className="sh" style={{ fontSize: "1.1rem", color: C.teal }}>{q.plays || 0}</span>
                  <span style={{ color: "rgba(255,255,255,.3)", fontSize: ".72rem" }}>plays</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PROFILE PAGE
═══════════════════════════════════════════════════════════════════ */
function ProfilePage({ user, quizzes, onNav }) {
  const [tab, setTab] = useState("history");
  if (!user) return <div className="page"><div className="center sub" style={{ marginTop: 60 }}>Please login to view your profile.</div></div>;

  const history = user.history || [];
  const catMap = {};
  history.forEach(h => {
    const q = quizzes.find(qz => qz.id === h.quizId);
    const cat = q?.category || "Other";
    if (!catMap[cat]) catMap[cat] = { correct: 0, total: 0 };
    catMap[cat].correct += h.score;
    catMap[cat].total += h.total;
  });
  const accuracy = history.length ? Math.round(history.reduce((s, h) => s + h.score / h.total, 0) / history.length * 100) : 0;
  const bestScore = history.length ? Math.max(...history.map(h => Math.round(h.score / h.total * 100))) : 0;
  const totalPts = user.totalPoints || 0;

  return (
    <div className="page">
      {/* Profile header */}
      <div className="glass afu" style={{ padding: "24px 28px", marginBottom: 20, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ fontSize: "3.5rem", lineHeight: 1 }}>{user.avatar || "🧑"}</div>
        <div className="col g1" style={{ flex: 1 }}>
          <div className="sh" style={{ fontSize: "1.4rem", color: "#fff" }}>{user.name}</div>
          <div style={{ color: "rgba(255,255,255,.38)", fontSize: ".85rem" }}>{user.email}</div>
          <div className="row g2 mt1 wrap">
            <span className="badge badge-amber">💎 {totalPts.toLocaleString()} pts</span>
            <span className="badge badge-teal">📋 {history.length} quizzes</span>
            <span className="badge badge-mint">🎯 {accuracy}% avg accuracy</span>
          </div>
        </div>
        <div className="col g2" style={{ alignItems: "flex-end" }}>
          <div style={{ textAlign: "center" }}>
            <div className="sh" style={{ fontSize: "1.6rem", color: C.amber }}>{bestScore}%</div>
            <div style={{ color: "rgba(255,255,255,.3)", fontSize: ".72rem" }}>best score</div>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>📜 History</button>
        <button className={`tab ${tab === "analytics" ? "active" : ""}`} onClick={() => setTab("analytics")}>📊 Analytics</button>
      </div>

      {tab === "history" && (
        <div className="col g2">
          {history.length === 0 && <div className="center sub" style={{ padding: "40px 0" }}>No quiz history yet. Start playing!</div>}
          {history.map((h, i) => {
            const pct = Math.round(h.score / h.total * 100);
            const col = pct >= 80 ? C.mint : pct >= 60 ? C.teal : pct >= 40 ? C.amber : C.coral;
            return (
              <div key={i} className="hist-row afu" style={{ animationDelay: `${i * .05}s`, opacity: 0 }}>
                <div className="col g1" style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: ".9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.quizTitle}</span>
                  <span style={{ color: "rgba(255,255,255,.3)", fontSize: ".75rem" }}>{timeAgo(h.ts)}</span>
                </div>
                <div className="row g2">
                  {h.pts > 0 && <span className="badge badge-amber">+{h.pts}pts</span>}
                  <span className="sh" style={{ fontSize: "1.1rem", color: col }}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "analytics" && (
        <div className="glass afu" style={{ padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 12, marginBottom: 24 }}>
            {[
              { l: "Avg Accuracy", v: `${accuracy}%`, c: C.teal },
              { l: "Total Points", v: totalPts.toLocaleString(), c: C.amber },
              { l: "Quizzes Played", v: history.length, c: C.violet },
              { l: "Best Score", v: `${bestScore}%`, c: C.mint },
            ].map(s => (
              <div key={s.l} style={{ textAlign: "center", padding: "12px 8px", background: "rgba(255,255,255,.04)", borderRadius: 10 }}>
                <div className="sh" style={{ fontSize: "1.4rem", color: s.c }}>{s.v}</div>
                <div style={{ color: "rgba(255,255,255,.3)", fontSize: ".72rem", marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {Object.keys(catMap).length > 0 && (
            <>
              <div style={{
                fontWeight: 700, color: "rgba(255,255,255,.45)", fontSize: ".78rem",
                textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 12
              }}>Accuracy by Category</div>
              {Object.entries(catMap).map(([cat, d], i) => {
                const pct = Math.round(d.correct / d.total * 100);
                const col = pct >= 80 ? C.mint : pct >= 60 ? C.teal : pct >= 40 ? C.amber : C.coral;
                return (
                  <div key={cat} className="row g2 mb3" style={{ alignItems: "center" }}>
                    <span style={{ color: "rgba(255,255,255,.5)", fontSize: ".8rem", minWidth: 90, fontWeight: 600 }}>{cat}</span>
                    <div className="anly-bar-wrap">
                      <div className="anly-bar-fill" style={{ width: `${pct}%`, background: col }} />
                    </div>
                    <span style={{ color: col, fontSize: ".82rem", fontWeight: 700, minWidth: 36 }}>{pct}%</span>
                  </div>
                );
              })}
            </>
          )}

          {history.length >= 2 && (
            <>
              <div className="div" />
              <div style={{
                fontWeight: 700, color: "rgba(255,255,255,.45)", fontSize: ".78rem",
                textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 12
              }}>Recent Score Trend</div>
              <div className="row g1" style={{ alignItems: "flex-end", height: 60, gap: 6 }}>
                {history.slice(0, 12).reverse().map((h, i) => {
                  const pct = h.score / h.total;
                  const col = pct >= .8 ? C.mint : pct >= .6 ? C.teal : pct >= .4 ? C.amber : C.coral;
                  return (
                    <div key={i} title={`${h.quizTitle}: ${Math.round(pct * 100)}%`}
                      style={{
                        flex: 1, background: col, borderRadius: "3px 3px 0 0",
                        height: `${pct * 100}%`, minHeight: 4, opacity: .8, transition: "height 1s ease", cursor: "default"
                      }} />
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}