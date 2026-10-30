import { useEffect, useRef } from "react";
import C from "../../styles/theme";

export default function BgCanvas(){
  const ref=useRef();
  useEffect(()=>{
    const cv=ref.current, ctx=cv.getContext("2d");
    let W,H,raf;
    const dots=[];
    const resize=()=>{W=cv.width=innerWidth;H=cv.height=innerHeight};
    resize(); window.addEventListener("resize",resize);
    for(let i=0;i<70;i++) dots.push({
      x:Math.random()*2000,y:Math.random()*1200,
      vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,
      r:.8+Math.random()*2,o:.08+Math.random()*.22
    });
    let t=0;
    const draw=()=>{
      ctx.clearRect(0,0,W,H); t+=.003;
      dots.forEach(d=>{
        d.x+=d.vx; d.y+=d.vy;
        if(d.x<0)d.x=W; if(d.x>W)d.x=0;
        if(d.y<0)d.y=H; if(d.y>H)d.y=0;
        ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(0,212,212,${d.o})`;ctx.fill();
      });
      for(let i=0;i<dots.length;i++) for(let j=i+1;j<dots.length;j++){
        const dx=dots[i].x-dots[j].x,dy=dots[i].y-dots[j].y,dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<100){ctx.beginPath();ctx.moveTo(dots[i].x,dots[i].y);ctx.lineTo(dots[j].x,dots[j].y);
          ctx.strokeStyle=`rgba(0,212,212,${.05*(1-dist/100)})`;ctx.lineWidth=1;ctx.stroke();}
      }
      const gx=W/2+Math.cos(t)*W*.28,gy=H/2+Math.sin(t*.7)*H*.22;
      [[gx,gy,280,C.teal,.045],[W-gx,H-gy,220,C.violet,.03],[W*.1,H*.8,180,C.amber,.025]].forEach(([x,y,r,col,a])=>{
        ctx.save();ctx.globalAlpha=a*3;
        ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
        const gr=ctx.createRadialGradient(x,y,0,x,y,r);
        gr.addColorStop(0,col+"44");gr.addColorStop(1,"transparent");
        ctx.fillStyle=gr;ctx.fill();ctx.restore();
      });
      raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize)};
  },[]);
  return <canvas ref={ref} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}/>;
}
