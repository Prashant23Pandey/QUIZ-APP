const C = {
  teal:"#00d4d4", tealD:"#00aaaa", tealDk:"#007a7a",
  coral:"#ff5f6d", coralD:"#e04450",
  amber:"#ffc851", amberD:"#e6b040",
  mint:"#43e97b", mintD:"#2ec464",
  violet:"#a78bfa", violetD:"#8b5cf6",
  navy:"#080f1e", navyM:"#0d1b30", navyL:"#132440",
  slate:"#3a5070", slateL:"#8aaac8",
  white:"#fff", off:"#f0fbfb",
  glass:"rgba(255,255,255,0.055)",
  glassBorder:"rgba(255,255,255,0.11)",
};

export const DIFF_CONFIG = {
  easy:   {label:"Easy",   color:C.mint,   time:25, multiplier:1,   icon:"🟢"},
  medium: {label:"Medium", color:C.amber,  time:20, multiplier:1.5, icon:"🟡"},
  hard:   {label:"Hard",   color:C.coral,  time:15, multiplier:2,   icon:"🔴"},
};

export const AVATARS = ["🦁","🐯","🦊","🐺","🦅","🐉","🦋","🐬","🦄","🤖","👾","🎭"];
export const CATEGORIES = ["General","Science","Geography","History","Math","Entertainment","Technology","Sports","Art","Other"];

export default C;
