import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, NavLink, useNavigate, useLocation, Link } from 'react-router-dom'
import { LayoutDashboard, BookOpen, CircleHelp, Trophy, Settings, LogOut, Search, Bell, Plus, Flame, Gem, Medal, ArrowUpRight, Users, Sparkles, Menu, X, CheckCircle2, FileText, Youtube, Send, ThumbsUp, ChevronRight } from 'lucide-react'
import api from './api'
import AnswerRenderer from './AnswerRenderer'

function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const change = e => setForm({ ...form, [e.target.name]: e.target.value })
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('')
    try {
      const { data } = await api.post(`/auth/${mode}`, form)
      localStorage.setItem('peerconnect_token', data.token)
      onAuth(data.user); navigate('/')
    } catch (err) { setError(err.response?.data?.message || 'Could not connect to the server. Check that the backend is running.') }
    finally { setBusy(false) }
  }
  return <div className="auth-wrap"><div className="auth-card"><div className="brand"><span className="brand-mark">P</span>PeerConnect</div><div className="auth-intro"><span className="eyebrow">YOUR LEARNING COMMUNITY</span><h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1><p>{mode === 'login' ? 'Sign in to continue learning with your peers.' : 'Join a community where questions become knowledge.'}</p></div>
    <form onSubmit={submit} className="form-stack">
      {mode === 'register' && <label>Full name<input name="name" value={form.name} onChange={change} placeholder="Your name" required maxLength="60"/></label>}
      <label>Email address<input name="email" type="email" value={form.email} onChange={change} placeholder="you@example.com" required/></label>
      <label>Password<input name="password" type="password" value={form.password} onChange={change} placeholder="At least 8 characters" required minLength="8"/></label>
      {error && <div className="error-box">{error}</div>}
      <button className="primary-button full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
    </form>
    <p className="auth-switch">{mode === 'login' ? "New to PeerConnect?" : 'Already have an account?'} <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>{mode === 'login' ? 'Create account' : 'Sign in'}</button></p>
    <p className="auth-foot">Real accounts only. No preloaded demo users.</p>
  </div></div>
}

function Shell({ user, onLogout, children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const links = [{to:'/',label:'Dashboard',icon:LayoutDashboard},{to:'/doubts',label:'Explore doubts',icon:BookOpen},{to:'/ask',label:'Ask a doubt',icon:CircleHelp}]
  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-mark">P</span>PeerConnect <button className="mobile-close" onClick={() => setMobileOpen(false)}><X/></button></div>
      <div className="profile"><div className="avatar">{user.name?.charAt(0)?.toUpperCase()}</div><strong>{user.name}</strong><span>Student member</span></div>
      <p className="nav-heading">LEARNING</p>
      {links.map(({to,label,icon:Icon})=><NavLink end={to==='/'} key={to} to={to} onClick={()=>setMobileOpen(false)} className={({isActive})=>`nav-link ${isActive?'active':''}`}><Icon size={18}/>{label}</NavLink>)}
      <p className="nav-heading account-heading">ACCOUNT</p>
      <NavLink to="/profile" onClick={()=>setMobileOpen(false)} className={({isActive})=>`nav-link ${isActive?'active':''}`}><Settings size={18}/>Profile & settings</NavLink>
      <div className="sidebar-bottom"><button className="nav-link" onClick={onLogout}><LogOut size={18}/>Sign out</button></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu" onClick={()=>setMobileOpen(true)}><Menu/></button><div><span className="eyebrow">PEER LEARNING NETWORK</span><h1>Learning space</h1></div><div className="top-actions"><div className="search"><Search size={17}/><input placeholder="Explore doubts…" onKeyDown={e=>{if(e.key==='Enter') window.location.href=`/doubts?q=${encodeURIComponent(e.target.value)}`}}/></div><span className="top-avatar">{user.name?.charAt(0)?.toUpperCase()}</span></div></header>
      {children}
      <footer>PeerConnect <span>•</span> Learn together. Solve together. Grow together.</footer>
    </main>
  </div>
}

function Dashboard({ user }) {
  const [data,setData] = useState(null), [recent,setRecent] = useState([]), [error,setError] = useState('')
  useEffect(()=>{ Promise.all([api.get('/dashboard'),api.get('/doubts')]).then(([a,b])=>{setData(a.data);setRecent(b.data.doubts.slice(0,4))}).catch(e=>setError(e.response?.data?.message||'Could not load dashboard.')) },[])
  const stats=data?.stats
  return <><section className="welcome-row"><div><span className="eyebrow">YOUR LEARNING SPACE</span><h2>Hello, {user.name.split(' ')[0]}!</h2><p>Ask questions, share knowledge and grow together.</p></div><Link className="primary-button" to="/ask"><Plus size={18}/> Ask a doubt</Link></section>
    {error&&<div className="error-box">{error}</div>}
    <section className="stats-grid">
      <Stat tone="cream" icon={Gem} label="Your XP" value={stats?`${stats.xp} XP`:'—'} hint="Earn points by participating"/>
      <Stat tone="blue" icon={BookOpen} label="Your questions" value={stats?.myDoubts ?? '—'} hint="Questions you have posted"/>
      <Stat tone="yellow" icon={Flame} label="Your answers" value={stats?.myAnswers ?? '—'} hint="Human answers you have shared"/>
      <Stat tone="pink" icon={Medal} label="Learning streak" value={stats?`${stats.streak} days`:'—'} hint="Your recorded activity"/>
    </section>
    <section className="content-grid">
      <article className="panel"><div className="panel-heading"><div><h3>Recent community doubts</h3><p>Questions posted by real learners.</p></div><BookOpen/></div>
        {recent.length ? <div className="recent-list">{recent.map(d=><Link className="recent-item" key={d._id} to={`/doubts/${d._id}`}><div><strong>{d.title}</strong><span>{d.subject} · by {d.author?.name || 'Student'}</span></div><span className={`status ${d.status}`}>{d.status}</span></Link>)}</div> : <div className="empty-state"><CircleHelp/><strong>No questions yet</strong><span>When students post doubts, they will appear here.</span><Link to="/ask" className="text-button">Ask the first question <ChevronRight size={15}/></Link></div>}
        <Link to="/doubts" className="text-button">Explore all doubts <ChevronRight size={15}/></Link>
      </article>
      <article className="panel"><div className="panel-heading"><div><h3>Community leaderboard</h3><p>Ranked using actual earned XP.</p></div><Trophy/></div>
        {data?.leaderboard?.length ? <div className="leader-list">{data.leaderboard.map((p,i)=><div className="leader-row" key={p._id}><b>{i+1}</b><span className="mini-avatar">{p.name.charAt(0)}</span><strong>{p.name}</strong><span>{p.xp} XP</span></div>)}</div> : <div className="empty-state"><Users/><strong>Leaderboard is waiting</strong><span>It will populate as learners earn XP.</span></div>}
      </article>
      <article className="panel wide-panel"><div className="panel-heading"><div><h3>Your learning activity</h3><p>Only your saved account activity is shown.</p></div><Sparkles/></div><div className="activity-summary"><div><strong>{stats?.totalDoubts ?? '—'}</strong><span>Community questions</span></div><div><strong>{stats?.myDoubts ?? '—'}</strong><span>Your questions</span></div><div><strong>{stats?.myAnswers ?? '—'}</strong><span>Your human answers</span></div></div></article>
    </section>
  </>
}
function Stat({tone,icon:Icon,label,value,hint}){return <article className={`stat-card ${tone}`}><div className="stat-icon"><Icon/></div><span className="stat-label">{label}</span><strong>{value}</strong><small>{hint}</small></article>}

function AskDoubt(){
  const [form,setForm]=useState({title:'',description:'',subject:'',tags:''}),[files,setFiles]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState('')
  const navigate=useNavigate()
  async function submit(e){e.preventDefault();setBusy(true);setError('');try{const body=new FormData();Object.entries(form).forEach(([k,v])=>body.append(k,v));files.forEach(f=>body.append('attachments',f));const {data}=await api.post('/doubts',body);navigate(`/doubts/${data.doubt._id}`)}catch(err){setError(err.response?.data?.message||'Could not post your question.')}finally{setBusy(false)}}
  return <section className="page-section"><div className="page-title"><span className="eyebrow">ASK THE COMMUNITY</span><h2>What are you stuck on?</h2><p>Describe your question clearly. Add an image, notes or document if it helps.</p></div><form className="panel form-stack" onSubmit={submit}>
    <label>Question title<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. How does binary search work?" required maxLength="180"/></label>
    <label>Subject<input value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} placeholder="e.g. Data Structures, Mathematics, Physics" required maxLength="80"/></label>
    <label>Explain your doubt<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Write what you tried, where you got stuck, and what you want to understand…" required rows="7" maxLength="12000"/></label>
    <label>Tags <span className="optional">(optional, comma separated)</span><input value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="arrays, algorithms, beginner"/></label>
    <label className="upload-box"><FileText size={22}/><strong>Attach supporting files</strong><span>Images, PDF, TXT, DOC or DOCX · up to 4 files, 12 MB each</span><input type="file" multiple accept="image/png,image/jpeg,image/webp,application/pdf,text/plain,text/markdown,text/csv,.doc,.docx" onChange={e=>setFiles(Array.from(e.target.files||[]))}/>{files.length>0&&<small>{files.map(f=>f.name).join(' · ')}</small>}</label>
    {error&&<div className="error-box">{error}</div>}<button className="primary-button" disabled={busy}>{busy?'Posting…':'Post question'} <Send size={16}/></button>
  </form></section>
}

function DoubtList(){
  const [doubts,setDoubts]=useState([]),[q,setQ]=useState(new URLSearchParams(window.location.search).get('q')||''),[busy,setBusy]=useState(true),[error,setError]=useState('')
  async function load(){setBusy(true);try{const {data}=await api.get('/doubts',{params:q?{q}:{}});setDoubts(data.doubts);setError('')}catch(e){setError(e.response?.data?.message||'Could not load questions.')}finally{setBusy(false)}}
  useEffect(()=>{load()},[])
  return <section className="page-section"><div className="page-title"><span className="eyebrow">PEER KNOWLEDGE</span><h2>Explore doubts</h2><p>Learn from questions shared by the community.</p></div><div className="list-search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search questions or subjects…"/><button className="primary-button" onClick={load}>Search</button><Link className="outline-button" to="/ask"><Plus size={16}/> Ask</Link></div>
    {error&&<div className="error-box">{error}</div>}{busy?<p className="muted">Loading questions…</p>:doubts.length?<div className="doubt-list">{doubts.map(d=><Link to={`/doubts/${d._id}`} className="doubt-card" key={d._id}><div className="doubt-meta"><span>{d.subject}</span><span className={`status ${d.status}`}>{d.status}</span></div><h3>{d.title}</h3><p>{d.description.slice(0,190)}{d.description.length>190?'…':''}</p><div className="doubt-foot"><span>Asked by {d.author?.name||'Student'}</span><span>{new Date(d.createdAt).toLocaleDateString()}</span></div></Link>)}</div>:<div className="empty-state panel"><CircleHelp/><strong>No matching doubts</strong><span>Try another search or ask a new question.</span><Link to="/ask" className="primary-button">Ask a doubt</Link></div>}
  </section>
}

function Flowchart({items=[]}){if(!items.length)return null;return <div className="flowchart">{items.map((item,i)=><div className="flow-step-wrap" key={`${item}-${i}`}><div className={`flow-step ${i===0||i===items.length-1?'terminal':''}`}>{item}</div>{i!==items.length-1&&<div className="flow-arrow">↓</div>}</div>)}</div>}

function DoubtDetail({user}){
  const {id}=useLocation().pathname.match(/\/doubts\/([^/]+)/)?.groups||{}
  const doubtId=window.location.pathname.split('/').pop()
  const [doubt,setDoubt]=useState(null),[answers,setAnswers]=useState([]),[answerText,setAnswerText]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[videos,setVideos]=useState(null),[videoBusy,setVideoBusy]=useState(false)
  async function load(){try{const {data}=await api.get(`/doubts/${doubtId}`);setDoubt(data.doubt);setAnswers(data.answers)}catch(e){setError(e.response?.data?.message||'Could not load this question.')}}
  useEffect(()=>{load()},[doubtId])
  async function ai(){setBusy(true);setError('');try{const {data}=await api.post(`/doubts/${doubtId}/ai-answer`);setAnswers(prev=>[...prev,data.answer])}catch(e){setError(e.response?.data?.message||'AI request failed.')}finally{setBusy(false)}}
  async function human(e){e.preventDefault();setBusy(true);try{const {data}=await api.post(`/doubts/${doubtId}/answers`,{body:answerText});setAnswers(prev=>[...prev,data.answer]);setAnswerText('');load()}catch(e){setError(e.response?.data?.message||'Could not submit answer.')}finally{setBusy(false)}}
  async function recommend(query){setVideoBusy(true);try{const {data}=await api.get('/youtube/search',{params:{q:query||`${doubt.subject} ${doubt.title} tutorial`}});setVideos(data)}catch(e){setError(e.response?.data?.message||'Could not search YouTube.')}finally{setVideoBusy(false)}}
  async function vote(answerId){try{const {data}=await api.post(`/doubts/${doubtId}/answers/${answerId}/vote`);setAnswers(prev=>prev.map(a=>a._id===answerId?{...a,votes:Array(data.votes).fill(null)}:a))}catch(e){setError(e.response?.data?.message||'Could not vote.')}}
  async function accept(answerId){try{await api.post(`/doubts/${doubtId}/answers/${answerId}/accept`);load()}catch(e){setError(e.response?.data?.message||'Could not accept answer.')}}
  if(!doubt)return <section className="page-section">{error?<div className="error-box">{error}</div>:<p className="muted">Loading question…</p>}<Link to="/doubts" className="text-button">Back to doubts</Link></section>
  return <section className="page-section"><Link to="/doubts" className="text-button">← Back to community doubts</Link><article className="panel question-panel"><div className="doubt-meta"><span>{doubt.subject}</span><span className={`status ${doubt.status}`}>{doubt.status}</span></div><h2>{doubt.title}</h2><p className="question-description">{doubt.description}</p><div className="doubt-foot"><span>Asked by {doubt.author?.name}</span><span>{new Date(doubt.createdAt).toLocaleString()}</span></div>
    {doubt.attachments?.length>0&&<div className="attachments"><strong>Supporting material</strong><div className="attachment-grid">{doubt.attachments.map(f=>{
      const url = `http://127.0.0.1:5001${f.url}`
      const isImage = f.mimetype?.startsWith('image/')
      const isPdf = f.mimetype === 'application/pdf'
      return <div className="attachment-preview" key={f.filename}>
        {isImage ? <a href={url} target="_blank" rel="noreferrer"><img src={url} alt={f.originalName}/></a>
          : isPdf ? <a className="attachment-file pdf-file" href={url} target="_blank" rel="noreferrer"><FileText/><span>PDF preview</span></a>
          : <a className="attachment-file" href={url} target="_blank" rel="noreferrer"><FileText/><span>Open document</span></a>}
        <span className="attachment-name">{f.originalName}</span>
      </div>
    })}</div></div>}
    <div className="action-row"><button className="primary-button" onClick={ai} disabled={busy}><Sparkles size={16}/>{busy?'Generating…':'Generate AI explanation'}</button><button className="outline-button" onClick={()=>recommend()} disabled={videoBusy}><Youtube size={17}/> {videoBusy?'Searching…':'Find YouTube videos'}</button></div>
  </article>
  {error&&<div className="error-box">{error}</div>}
  <div className="section-heading"><h3>Solutions & explanations</h3><span>{answers.length} responses</span></div>
  {answers.map(a=><article className="panel answer-card" key={a._id}><div className="answer-top"><span className={`answer-kind ${a.kind}`}>{a.kind==='ai'?'AI-assisted explanation':'Human answer'}</span>{a.accepted&&<span className="accepted"><CheckCircle2 size={14}/> Accepted answer</span>}</div><AnswerRenderer answer={a}/>
    {a.steps?.length>0&&<><h4>Step-by-step</h4><ol className="steps-list">{a.steps.map((s,i)=><li key={i}>{s}</li>)}</ol></>}
    {a.flowchart?.length>0&&<><h4>Visual flowchart</h4><Flowchart items={a.flowchart}/></>}
    <div className="answer-bottom"><span>{a.kind==='ai'?'Generated with local Ollama AI':`Answered by ${a.author?.name||'Community member'}`}</span><button className="outline-button small" onClick={()=>vote(a._id)}><ThumbsUp size={14}/> Helpful ({a.votes?.length||0})</button>{doubt.author?._id===user.id&&a.kind==='human'&&!a.accepted&&<button className="text-button" onClick={()=>accept(a._id)}>Accept answer</button>}</div>
  </article>)}
  <article className="panel form-stack"><h3>Share a human answer</h3><p className="muted">Add your own explanation. Your answer will be clearly identified as a human contribution.</p><form onSubmit={human} className="form-stack"><textarea rows="5" value={answerText} onChange={e=>setAnswerText(e.target.value)} placeholder="Explain the solution in your own words…" required minLength="5"/><button className="primary-button" disabled={busy}>Post human answer <Send size={15}/></button></form></article>
  {videos&&<article className="panel video-panel"><div className="panel-heading"><div><h3>Related YouTube learning</h3><p>{videos.configured?'Results from YouTube Data API':'Open a real YouTube search for this topic'}</p></div><Youtube/></div>
    {videos.configured&&videos.videos.length?videos.videos.map(v=><a className="video-item" href={v.url} target="_blank" rel="noreferrer" key={v.id}><img src={v.thumbnail} alt=""/><div><strong>{v.title}</strong><span>{v.channel}</span></div><ArrowUpRight/></a>):<a className="youtube-search-link" href={videos.searchUrl} target="_blank" rel="noreferrer"><Youtube/> Search YouTube for relevant lessons <ArrowUpRight/></a>}
  </article>}
  </section>
}

function Profile({user,onUser}){const [name,setName]=useState(user.name),[bio,setBio]=useState(user.bio||''),[message,setMessage]=useState('');async function save(e){e.preventDefault();try{const {data}=await api.patch('/auth/me',{name,bio});onUser(data.user);setMessage('Profile updated.')}catch(e){setMessage(e.response?.data?.message||'Could not update profile.')}}return <section className="page-section"><div className="page-title"><span className="eyebrow">YOUR ACCOUNT</span><h2>Profile & settings</h2><p>Manage your learning identity.</p></div><form className="panel form-stack" onSubmit={save}><label>Name<input value={name} onChange={e=>setName(e.target.value)} required maxLength="60"/></label><label>Email<input value={user.email} disabled/></label><label>About you<textarea rows="4" value={bio} onChange={e=>setBio(e.target.value)} maxLength="240" placeholder="What are you learning?"/></label>{message&&<div className="notice">{message}</div>}<button className="primary-button">Save profile</button></form></section>}

export default function App(){
  const [user,setUser]=useState(null),[checking,setChecking]=useState(true)
  useEffect(()=>{const token=localStorage.getItem('peerconnect_token');if(!token){setChecking(false);return}api.get('/auth/me').then(r=>setUser(r.data.user)).catch(()=>localStorage.removeItem('peerconnect_token')).finally(()=>setChecking(false))},[])
  function logout(){localStorage.removeItem('peerconnect_token');setUser(null)}
  if(checking)return <div className="loading-screen">Loading PeerConnect…</div>
  if(!user)return <AuthPage onAuth={setUser}/>
  return <Shell user={user} onLogout={logout}><Routes><Route path="/" element={<Dashboard user={user}/>}/><Route path="/ask" element={<AskDoubt/>}/><Route path="/doubts" element={<DoubtList/>}/><Route path="/doubts/:id" element={<DoubtDetail user={user}/>}/><Route path="/profile" element={<Profile user={user} onUser={setUser}/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></Shell>
}
