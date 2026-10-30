import C from "../../styles/theme";

export default function TimerRing({total, left, size=56}){
  const r=(size-8)/2, circ=2*Math.PI*r, pct=left/total;
  const col=pct>.5?C.teal:pct>.25?C.amber:C.coral;
  return(
    <div className="tring" style={{width:size,height:size}}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.09)" strokeWidth={5}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round"
          style={{transition:"stroke-dashoffset .95s linear,stroke .4s",filter:`drop-shadow(0 0 5px ${col})`}}/>
      </svg>
      <span className="tring-num" style={{color:col,fontSize:left<=5?"1rem":".9rem",
        animation:left<=5?"pulse2 .6s infinite":""}}>{left}</span>
    </div>
  );
}
