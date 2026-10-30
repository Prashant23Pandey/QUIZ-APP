import { useState, useEffect } from "react";
import Modal from "../ui/Modal";

export default function AIExplainModal({question, userAnswer, onClose}){
  const [explanation,setExplanation]=useState("");
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    (async()=>{
      try{
        const res=await fetch("https://api.anthropic.com/v1/messages",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({
            model:"claude-sonnet-4-20250514",max_tokens:1000,
            messages:[{role:"user",content:`Quiz question: "${question.text}"
Options: ${question.options.map((o,i)=>`${["A","B","C","D"][i]}: ${o}`).join(", ")}
Correct answer: ${question.options[question.correct]}
User answered: ${userAnswer!=null&&userAnswer>=0?question.options[userAnswer]:"(timed out)"}

Give a clear, engaging 2-3 sentence explanation of why the correct answer is right and why the user's answer (if wrong) is incorrect. Be educational but fun. No headers, just plain text.`}]
          })
        });
        const data=await res.json();
        setExplanation(data.content.map(b=>b.text||"").join(""));
      }catch{setExplanation("Could not fetch explanation. Please try again.")}
      setLoading(false);
    })();
  },[]);

  return(
    <Modal onClose={onClose}>
      <div className="row-sb mb4">
        <div className="sh" style={{fontSize:"1.1rem",color:"#fff"}}>💡 AI Explanation</div>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>✕</button>
      </div>
      <div style={{color:"rgba(255,255,255,.7)",fontSize:".9rem",lineHeight:1.6,marginBottom:16}}>{question.text}</div>
      <div className="div"/>
      {loading
        ?<div className="row g2 mt2"><div className="ai-thinking"><div className="ai-dot"/><div className="ai-dot"/><div className="ai-dot"/></div><span className="sub">Explaining…</span></div>
        :<div style={{color:"rgba(255,255,255,.85)",fontSize:".9rem",lineHeight:1.7,padding:"14px 16px",
          background:"rgba(0,212,212,.07)",border:"1px solid rgba(0,212,212,.18)",borderRadius:12}}>{explanation}</div>
      }
    </Modal>
  );
}
