import C from "../styles/theme";

export function spawnParticles(x, y, type="correct") {
  const sets = {
    correct:["✨","⭐","💫","🌟","🎉"],
    wrong:["💥","😬","❌","😅","💢"],
    lifeline:["🛡️","💡","✂️","🌀"],
    points:["💎","⬆️","🔥","💰"],
  };
  const emojis = sets[type]||sets.correct;
  for (let i=0;i<6;i++){
    const el=document.createElement("div");
    el.style.cssText=`position:fixed;z-index:9999;pointer-events:none;font-size:${1.2+Math.random()*0.8}rem;
      left:${x+(Math.random()-.5)*100}px;top:${y+(Math.random()-.5)*60}px;
      animation:pfloat ${1+Math.random()*.6}s ease-out forwards;animation-delay:${i*.07}s`;
    el.textContent=emojis[Math.floor(Math.random()*emojis.length)];
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),2000);
  }
}

export function spawnConfetti(n=80){
  const cols=[C.teal,C.amber,C.mint,C.coral,C.violet,"#fff","#ffd700"];
  for(let i=0;i<n;i++){
    const el=document.createElement("div");
    const size=5+Math.random()*8;
    el.style.cssText=`position:fixed;z-index:9998;pointer-events:none;
      left:${Math.random()*100}vw;top:-20px;
      width:${size}px;height:${size}px;border-radius:${Math.random()>0.5?"50%":"2px"};
      background:${cols[Math.floor(Math.random()*cols.length)]};
      animation:cfall ${1.5+Math.random()}s ease-out forwards;
      animation-delay:${Math.random()*1.2}s;
      transform:rotate(${Math.random()*360}deg)`;
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),3500);
  }
}

export function spawnFloatingPoints(x,y,pts){
  const el=document.createElement("div");
  el.style.cssText=`position:fixed;z-index:9999;pointer-events:none;
    left:${x}px;top:${y-30}px;font-family:'Syne',sans-serif;font-weight:900;
    font-size:1.4rem;color:${C.amber};text-shadow:0 0 12px ${C.amber};
    animation:pfloat 1.3s ease-out forwards;`;
  el.textContent=`+${pts}`;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),1500);
}
