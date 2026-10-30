import C from "../../styles/theme";

export default function ScoreDonut({score, total, pts, size=170}){
  const pct=score/total, r=(size-18)/2, circ=2*Math.PI*r;
  const col=pct>=.8?C.mint:pct>=.6?C.teal:pct>=.4?C.amber:C.coral;
  const label=pct>=.8?"🏆 Legendary!":pct>=.6?"🎉 Great Work!":pct>=.4?"💪 Keep Going!":"📚 Study More!";
  return(
    <div className="col g2" style={{alignItems:"center"}}>
      <div className="donut-wrap" style={{width:size,height:size}}>
        <div className="col" style={{alignItems:"center",gap:2,zIndex:1}}>
          <span className="sh" style={{fontSize:"2.1rem",color:col,animation:"countUp .7s ease"}}>{Math.round(pct*100)}%</span>
          <span style={{color:"rgba(255,255,255,.35)",fontSize:".72rem"}}>{score}/{total} correct</span>
          {pts>0&&<span style={{color:C.amber,fontSize:".8rem",fontWeight:700}}>+{pts} pts</span>}
        </div>
        <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={13}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={13}
            strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round"
            style={{transition:"stroke-dashoffset 1.6s cubic-bezier(.65,0,.35,1)",
              filter:`drop-shadow(0 0 10px ${col})`}}/>
        </svg>
      </div>
      <span className="sh" style={{fontSize:"1.05rem",color:col}}>{label}</span>
    </div>
  );
}
