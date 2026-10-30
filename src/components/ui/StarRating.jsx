import { useState } from "react";

export default function StarRating({value, onChange, size="1.5rem"}){
  const [hover,setHover]=useState(0);
  return(
    <div className="row g1">
      {[1,2,3,4,5].map(i=>(
        <span key={i} className="star" style={{fontSize:size,filter:(hover||value)>=i?"none":"grayscale(1)",opacity:(hover||value)>=i?1:.4}}
          onMouseEnter={()=>onChange&&setHover(i)} onMouseLeave={()=>onChange&&setHover(0)}
          onClick={()=>onChange&&onChange(i)}>⭐</span>
      ))}
      {!onChange&&<span style={{color:"rgba(255,255,255,.4)",fontSize:".8rem",fontWeight:600}}>({value})</span>}
    </div>
  );
}
