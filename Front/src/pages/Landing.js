import { Link } from 'react-router-dom'

export default function Landing(){
  return (
    <div className="container hero">
      <div>
        <div style={{display:'flex',justifyContent:'center',gap:8,opacity:.9}}>
          <span className="post-badge lost">LOST</span>
          <span className="post-badge found">FOUND</span>
        </div>
        <h1>Lost & Found</h1>
        <p>A community-powered way to reunite lost items with their owners.</p>
        <div className="cta" style={{justifyContent:'center'}}>
          <Link to="/login" className="btn primary">Login</Link>
          <Link to="/signup" className="btn">Sign Up</Link>
        </div>
      </div>
    </div>
  )
}
