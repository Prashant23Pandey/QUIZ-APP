import { useState } from "react";
import Modal from "../ui/Modal";
import C, { DIFF_CONFIG } from "../../styles/theme";

export default function AIGenerateModal({onGenerated, onClose}){
  const [topic,setTopic]=useState("");
  const [count,setCount]=useState(5);
  const [diff,setDiff]=useState("medium");
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");

  const generate=async()=>{
    if(!topic.trim()){setErr("Enter a topic first.");return}
    setLoading(true);setErr("");
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          messages:[{role:"user",content:`Generate exactly ${count} multiple-choice quiz questions about: "${topic}".
Difficulty: ${diff}.
Return ONLY valid JSON, no markdown, no extra text:
{"title":"...","questions":[{"text":"question","options":["A","B","C","D"],"correct":0,"hint":"short hint"}]}
correct is 0-3 index. Make questions interesting and varied.`}]
        })
      });
      const data=await res.json();
      const text=data.content.map(b=>b.text||"").join("").replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(text);
      onGenerated({...parsed,category:topic,difficulty:diff});
    }catch(e){setErr("Generation failed. Try again.")}
    setLoading(false);
  };

  return(
    <Modal onClose={onClose}>
      <div className="row-sb mb4">
        <div>
          <div className="sh" style={{fontSize:"1.3rem",color:"#fff"}}>🤖 AI Quiz Generator</div>
          <div className="sub mt1">Let Claude build your quiz instantly</div>
        </div>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>✕</button>
      </div>
      <label className="lbl">Topic or Subject</label>
      <input className="inp mb3" placeholder="e.g. Ancient Rome, JavaScript, Space..." value={topic} onChange={e=>setTopic(e.target.value)}/>
      <div className="row g3 mb3 wrap">
        <div style={{flex:1,minWidth:100}}>
          <label className="lbl">Questions</label>
          <select className="inp" value={count} onChange={e=>setCount(+e.target.value)}>
            {[3,5,7,10].map(n=><option key={n} value={n}>{n} questions</option>)}
          </select>
        </div>
        <div style={{flex:1,minWidth:100}}>
          <label className="lbl">Difficulty</label>
          <select className="inp" value={diff} onChange={e=>setDiff(e.target.value)}>
            {Object.entries(DIFF_CONFIG).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
          </select>
        </div>
      </div>
      {err&&<div style={{color:C.coral,fontSize:".82rem",fontWeight:600,marginBottom:10}}>{err}</div>}
      {loading
        ?<div className="col g2" style={{alignItems:"center",padding:"16px 0"}}>
          <div className="ai-thinking"><div className="ai-dot"/><div className="ai-dot"/><div className="ai-dot"/></div>
          <span className="sub" style={{fontSize:".82rem"}}>Claude is thinking…</span>
        </div>
        :<button className="btn btn-teal w100" style={{justifyContent:"center"}} onClick={generate}>✨ Generate Quiz</button>
      }
    </Modal>
  );
}
