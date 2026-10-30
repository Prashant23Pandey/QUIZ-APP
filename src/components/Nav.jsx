export default function Nav({user,onLogout,onNav}){
  return(
    <nav className="nav">
      <div className="logo" onClick={()=>onNav("home")}>⚡ QuizMaker</div>
      <div className="nav-links">
        <button className="btn btn-ghost btn-sm" onClick={()=>onNav("list")}>Browse</button>
        <button className="btn btn-ghost btn-sm" onClick={()=>onNav("leaderboard")}>🏆 Board</button>
        {user?(
          <>
            <div className="pts-chip">💎 {(user.totalPoints||0).toLocaleString()}</div>
            <div className="user-pill" style={{cursor:"pointer"}} onClick={()=>onNav("profile")}>
              <div className="live-dot"/>{user.avatar} {user.name}
            </div>
            <button className="btn btn-coral btn-sm" onClick={onLogout}>Out</button>
          </>
        ):(
          <>
            <button className="btn btn-ghost btn-sm" onClick={()=>onNav("login")}>Login</button>
            <button className="btn btn-teal btn-sm" onClick={()=>onNav("register")}>Sign Up</button>
          </>
        )}
      </div>
    </nav>
  );
}
