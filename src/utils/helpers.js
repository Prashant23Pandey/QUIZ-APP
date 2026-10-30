export function calcPoints(correct, timeLeft, maxTime, streak, multiplier) {
  if (!correct) return 0;
  const base = 100;
  const timeBonus = Math.floor((timeLeft / maxTime) * 50);
  const streakBonus = streak >= 3 ? 30 : streak >= 2 ? 15 : 0;
  return Math.floor((base + timeBonus + streakBonus) * multiplier);
}

export function avgRating(ratings) {
  if (!ratings?.length) return 0;
  return (ratings.reduce((s,r)=>s+r.score,0)/ratings.length).toFixed(1);
}

export function timeAgo(ts) {
  const s = Math.floor((Date.now()-ts)/1000);
  if (s<60) return "just now";
  if (s<3600) return `${Math.floor(s/60)}m ago`;
  if (s<86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}
