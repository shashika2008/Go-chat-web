import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Home, Compass, Plus, MessageCircle, User, LogOut, Search, Heart, Globe2, Shield, Languages } from "lucide-react";
import { supabase } from "./lib/supabase";
import { useLanguage } from "./lib/i18n";
import { getCurrentProfile, upsertProfile, createPost, uploadMedia } from "./lib/api";

function Shell({ session, children }) {
  const { t, lang, setLang } = useLanguage();
  const nav = useNavigate();
  async function logout() { await supabase.auth.signOut(); nav("/login"); }
  return <div className="app-shell">
    <div className="ambient ambient-a"/><div className="ambient ambient-b"/>
    <header className="topbar glass">
      <Link className="brand" to="/">Go<span>Chat</span></Link>
      <div className="top-actions">
        <button className="icon-btn" onClick={() => setLang(lang === "en" ? "si" : "en")} title="Language"><Languages size={19}/></button>
        <button className="icon-btn" onClick={logout} title={t("logout")}><LogOut size={19}/></button>
      </div>
    </header>
    <main className="main">{children}</main>
    {session && <nav className="bottom-nav glass">
      <NavItem to="/" icon={<Home/>} text={t("home")}/>
      <NavItem to="/discover" icon={<Compass/>} text={t("discover")}/>
      <NavItem to="/create" icon={<Plus/>} text={t("create")} special/>
      <NavItem to="/messages" icon={<MessageCircle/>} text={t("messages")}/>
      <NavItem to="/profile" icon={<User/>} text={t("profile")}/>
    </nav>}
  </div>
}
function NavItem({to, icon, text, special}) {
  return <Link className={`nav-item ${special ? "special" : ""}`} to={to}>{icon}<span>{text}</span></Link>
}

function Login() {
  const { t } = useLanguage(); const nav = useNavigate();
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [otp,setOtp]=useState("");
  const [mode,setMode]=useState("password"); const [status,setStatus]=useState("");
  async function passwordLogin(e) {
    e.preventDefault(); setStatus("Signing in...");
    const {error}=await supabase.auth.signInWithPassword({email,password});
    if(error) setStatus(error.message); else nav("/");
  }
  async function sendOtp(e) {
    e.preventDefault(); setStatus("Sending OTP...");
    const {error}=await supabase.auth.signInWithOtp({email, options:{shouldCreateUser:true}});
    setStatus(error ? error.message : "OTP sent. Check your email.");
  }
  async function verifyOtp(e) {
    e.preventDefault(); setStatus("Verifying...");
    const {error}=await supabase.auth.verifyOtp({email, token:otp, type:"email"});
    if(error) setStatus(error.message); else nav("/");
  }
  async function google() {
    await supabase.auth.signInWithOAuth({provider:"google", options:{redirectTo:window.location.origin}});
  }
  return <AuthCard title="Welcome to GoChat">
    {mode==="password" ? <form onSubmit={passwordLogin}>
      <Input label={t("email")} type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
      <Input label={t("password")} type="password" value={password} onChange={e=>setPassword(e.target.value)} required/>
      <button className="primary-btn">{t("login")}</button>
      <button type="button" className="ghost-btn" onClick={()=>setMode("otp")}>Use email OTP</button>
    </form> : <form onSubmit={otp ? verifyOtp : sendOtp}>
      <Input label={t("email")} type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
      {otp && <Input label="OTP" inputMode="numeric" value={otp} onChange={e=>setOtp(e.target.value)} maxLength={6} required/>}
      <button className="primary-btn">{otp ? t("verify") : t("sendOtp")}</button>
      <button type="button" className="ghost-btn" onClick={()=>{setMode("password");setOtp("")}}>Use password</button>
    </form>}
    <button className="google-btn" onClick={google}>Continue with Google</button>
    {status && <p className="status">{status}</p>}
    <p className="muted">New here? <Link to="/signup">Create an account</Link></p>
  </AuthCard>
}
function Signup() {
  const {t}=useLanguage(); const nav=useNavigate();
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [username,setUsername]=useState("");
  const [status,setStatus]=useState("");
  async function submit(e){
    e.preventDefault(); setStatus("Creating account...");
    const {data,error}=await supabase.auth.signUp({email,password,options:{data:{username}}});
    if(error) return setStatus(error.message);
    if(data.session) nav("/onboarding"); else setStatus("Check your email to verify your account.");
  }
  return <AuthCard title="Create your GoChat account">
    <form onSubmit={submit}>
      <Input label="Username" value={username} onChange={e=>setUsername(e.target.value)} minLength={3} required/>
      <Input label={t("email")} type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
      <Input label={t("password")} type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={8} required/>
      <button className="primary-btn">{t("signup")}</button>
    </form>
    <p className="muted">Already have an account? <Link to="/login">Login</Link></p>
    {status && <p className="status">{status}</p>}
  </AuthCard>
}
function AuthCard({title,children}) {
  return <div className="auth-page"><motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="auth-card glass">
    <div className="logo-orb"><Heart fill="currentColor"/></div><h1>{title}</h1><p className="muted">Connect. Create. Discover.</p>{children}
  </motion.div></div>
}
function Input({label,...props}) { return <label className="field"><span>{label}</span><input {...props}/></label> }

function Protected({session, children}) { return session ? children : <Navigate to="/login" replace/>; }

function HomePage({session}) {
  const [posts,setPosts]=useState([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{ import("./lib/api").then(({getFeed})=>getFeed().then(setPosts).catch(console.error).finally(()=>setLoading(false)))},[]);
  return <Shell session={session}><section className="hero glass">
    <div><p className="eyebrow">GLOBAL SOCIAL CONNECTION</p><h1>Find people who <span>connect</span> with you.</h1><p className="hero-copy">Discover friends, creators, communities and conversations in a premium interactive space.</p>
      <div className="hero-actions"><Link className="primary-btn" to="/discover">Explore people</Link><Link className="ghost-btn" to="/create">Create post</Link></div>
    </div><div className="globe"><Globe2 size={130}/><div className="orbit o1"/><div className="orbit o2"/></div>
  </section>
  <section className="section-head"><h2>Community feed</h2><Link to="/discover">Discover →</Link></section>
  {loading ? <div className="skeleton"/> : posts.length ? <div className="feed">{posts.map(p=><PostCard key={p.id} post={p}/>)}</div> : <div className="empty glass">No posts yet. Be the first to create one.</div>}
  </Shell>
}
function PostCard({post}) {
  return <motion.article whileHover={{y:-4}} className="post-card glass">
    <div className="post-author"><img src={post.profiles?.avatar_url || "https://placehold.co/80x80/111525/ffffff?text=GC"} /><div><b>{post.profiles?.display_name || post.profiles?.username || "GoChat user"}</b><small>@{post.profiles?.username || "user"}</small></div></div>
    <p>{post.body}</p>
    {post.media_url && (post.media_type?.startsWith("video") ? <video controls src={post.media_url}/> : <img className="post-media" src={post.media_url}/>)}
    <div className="post-actions"><button><Heart size={18}/> Like</button><button><MessageCircle size={18}/> Comment</button><button>↗ Share</button></div>
  </motion.article>
}
function Onboarding({session}) {
  const nav=useNavigate(); const [form,setForm]=useState({username:"",display_name:"",bio:"",country:"",region:"",city:""});
  async function submit(e){e.preventDefault(); await upsertProfile(session.user.id,form); nav("/");}
  return <Shell session={session}><div className="panel glass"><p className="eyebrow">PROFILE SETUP</p><h1>Build your profile</h1><form onSubmit={submit} className="grid-form">
    {Object.keys(form).map(k=><Input key={k} label={k.replace("_"," ")} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} required={["username","display_name","country"].includes(k)}/>)}
    <button className="primary-btn">Complete profile</button>
  </form></div></Shell>
}
function CreatePost({session}) {
  const nav=useNavigate(); const [body,setBody]=useState(""); const [file,setFile]=useState(null); const [status,setStatus]=useState("");
  async function submit(e){e.preventDefault(); try{setStatus("Uploading...");let url=null,type=null;if(file){url=await uploadMedia(session.user.id,file,"posts");type=file.type} await createPost(session.user.id,body,url,type);nav("/");}catch(err){setStatus(err.message)}}
  return <Shell session={session}><div className="panel glass"><p className="eyebrow">CREATE</p><h1>Share something</h1><form onSubmit={submit}><textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="What's on your mind?" rows="6"/><input type="file" accept="image/*,video/*" onChange={e=>setFile(e.target.files?.[0] || null)}/><button className="primary-btn">Publish</button></form>{status&&<p className="status">{status}</p>}</div></Shell>
}
function Discover({session}) {
  return <Shell session={session}><div className="section-head"><div><p className="eyebrow">DISCOVER</p><h1>People & communities</h1></div><Search/></div><div className="discovery-grid"><div className="discover-card glass"><div className="avatar-xl">GC</div><span className="online">● Online</span><h2>Build your discovery system</h2><p className="muted">Connect this screen to a profiles query and add filters for country, region, interests and online status.</p><button className="primary-btn">Message</button><button className="ghost-btn">Follow</button></div></div></Shell>
}
function Messages({session}) {
  return <Shell session={session}><div className="panel glass"><p className="eyebrow">REAL-TIME</p><h1>Messages</h1><p className="muted">This screen is ready for Supabase Realtime conversations and messages. Add conversations through the SQL schema included in this repo.</p><Link className="primary-btn" to="/profile">Open profile</Link></div></Shell>
}
function Profile({session}) {
  const [profile,setProfile]=useState(null);
  useEffect(()=>{getCurrentProfile(session.user.id).then(setProfile).catch(console.error)},[session.user.id]);
  return <Shell session={session}><div className="profile-hero glass"><img src={profile?.avatar_url || "https://placehold.co/160x160/111525/ffffff?text=GC"}/><div><p className="eyebrow">MY PROFILE</p><h1>{profile?.display_name || session.user.email}</h1><p>{profile?.bio || "Complete your profile to appear in Discover."}</p><div className="chips"><span>{profile?.country || "Country not set"}</span><span>{profile?.region || "Region not set"}</span></div></div></div></Shell>
}
export default function App(){
  const [session,setSession]=useState(null); const [ready,setReady]=useState(false);
  useEffect(()=>{supabase.auth.getSession().then(({data})=>{setSession(data.session);setReady(true)}); const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s)); return ()=>subscription.unsubscribe()},[]);
  if(!ready) return <div className="loading-screen">Loading GoChat…</div>;
  return <Routes>
    <Route path="/login" element={session?<Navigate to="/" replace/>:<Login/>}/>
    <Route path="/signup" element={session?<Navigate to="/" replace/>:<Signup/>}/>
    <Route path="/" element={<Protected session={session}><HomePage session={session}/></Protected>}/>
    <Route path="/onboarding" element={<Protected session={session}><Onboarding session={session}/></Protected>}/>
    <Route path="/create" element={<Protected session={session}><CreatePost session={session}/></Protected>}/>
    <Route path="/discover" element={<Protected session={session}><Discover session={session}/></Protected>}/>
    <Route path="/messages" element={<Protected session={session}><Messages session={session}/></Protected>}/>
    <Route path="/profile" element={<Protected session={session}><Profile session={session}/></Protected>}/>
    <Route path="*" element={<Navigate to={session?"/":"/login"} replace/>}/>
  </Routes>
}