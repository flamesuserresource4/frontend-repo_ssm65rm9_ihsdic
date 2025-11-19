import { useEffect, useState } from 'react'

const backendBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Header({ onNav }) {
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-slate-900/60 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/flame-icon.svg" alt="logo" className="w-8 h-8" />
          <span className="text-white font-semibold text-lg">DevLearn Pro</span>
        </div>
        <nav className="flex gap-4 text-sm text-blue-200">
          {['Home','Videos','Notes','Mentor','Convert','Progress'].map((item)=> (
            <button key={item} onClick={()=>onNav(item)} className="hover:text-white transition-colors">{item}</button>
          ))}
        </nav>
      </div>
    </header>
  )
}

function Hero({ onStart }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(147,51,234,0.12),transparent_40%)]" />
      <div className="max-w-7xl mx-auto px-6 py-24">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">Learn, Code, and Grow — all in one place</h1>
        <p className="mt-6 text-blue-200 max-w-2xl">Curated videos from top creators, smart notes, a built-in code editor and compiler, plus an AI mentor to guide your journey. Track progress and earn ranks.</p>
        <div className="mt-8 flex gap-3">
          <button onClick={onStart} className="px-5 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium">Start Learning</button>
          <a href="/test" className="px-5 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium">System Check</a>
        </div>
      </div>
    </section>
  )
}

function Videos() {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch(`${backendBase}/api/videos`).then(r=>r.json()).then(setData)
  }, [])
  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-semibold text-white mb-6">Curated YouTube Playlists</h2>
      {!data ? (
        <p className="text-blue-200">Loading...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.channels.map((ch)=> (
            <div key={ch.name} className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium">{ch.name}</h3>
                <a className="text-blue-300 text-sm hover:text-blue-200" href={ch.url} target="_blank">Visit</a>
              </div>
              <p className="text-blue-300 text-sm mb-3">Topics: {ch.topics.join(', ')}</p>
              <div className="space-y-3">
                {ch.videos.map(v => (
                  <div key={v.videoId} className="space-y-2">
                    <p className="text-white text-sm">{v.title}</p>
                    <div className="aspect-video rounded-lg overflow-hidden border border-white/10">
                      <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${v.videoId}`} title={v.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function Notes({ user, onCreated }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [items, setItems] = useState([])
  const load = async () => {
    if (!user) return
    const r = await fetch(`${backendBase}/api/notes?user_id=${user.user_id}`)
    const j = await r.json(); setItems(j)
  }
  useEffect(()=>{ load() }, [user])
  const create = async () => {
    if (!user) return
    const r = await fetch(`${backendBase}/api/notes`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({user_id: user.user_id, title, content})})
    const j = await r.json(); setTitle(''); setContent(''); onCreated?.(); load()
  }
  return (
    <section className="max-w-5xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-semibold text-white mb-4">Your Notes</h2>
      {!user ? <p className="text-blue-300">Please sign in to save notes.</p> : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-white/10">
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full mb-3 px-3 py-2 rounded bg-slate-900/60 text-white border border-white/10" />
            <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Write your notes here..." rows={8} className="w-full px-3 py-2 rounded bg-slate-900/60 text-white border border-white/10" />
            <div className="mt-3 flex justify-end">
              <button onClick={create} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">Save</button>
            </div>
          </div>
          <div className="space-y-3">
            {items.map(n => (
              <div key={n.id} className="bg-slate-800/50 p-4 rounded-xl border border-white/10">
                <h4 className="text-white font-medium">{n.title}</h4>
                <p className="text-blue-200 text-sm whitespace-pre-wrap mt-1">{n.content}</p>
              </div>
            ))}
            {items.length===0 && <p className="text-blue-300">No notes yet.</p>}
          </div>
        </div>
      )}
    </section>
  )
}

function Mentor() {
  const [question, setQuestion] = useState('How do I learn recursion?')
  const [language, setLanguage] = useState('')
  const [level, setLevel] = useState('beginner')
  const [answer, setAnswer] = useState('')
  const ask = async () => {
    setAnswer('Thinking...')
    const r = await fetch(`${backendBase}/api/ai/mentor`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({question, language, level})})
    const j = await r.json(); setAnswer(j.answer)
  }
  return (
    <section className="max-w-3xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-semibold text-white mb-4">AI Mentor</h2>
      <div className="bg-slate-800/50 p-4 rounded-xl border border-white/10">
        <input value={question} onChange={e=>setQuestion(e.target.value)} className="w-full mb-3 px-3 py-2 rounded bg-slate-900/60 text-white border border-white/10" />
        <div className="grid grid-cols-3 gap-3">
          <input value={language} onChange={e=>setLanguage(e.target.value)} placeholder="Language (optional)" className="px-3 py-2 rounded bg-slate-900/60 text-white border border-white/10" />
          <select value={level} onChange={e=>setLevel(e.target.value)} className="px-3 py-2 rounded bg-slate-900/60 text-white border border-white/10">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <button onClick={ask} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">Ask</button>
        </div>
        <pre className="mt-4 text-blue-200 whitespace-pre-wrap">{answer}</pre>
      </div>
    </section>
  )
}

function Converter() {
  const [source_language, setSrc] = useState('javascript')
  const [target_language, setTgt] = useState('python')
  const [code, setCode] = useState('console.log("Hello")')
  const [result, setResult] = useState('')
  const convert = async () => {
    setResult('Converting...')
    const r = await fetch(`${backendBase}/api/ai/convert`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({source_language, target_language, code})})
    const j = await r.json(); setResult(j.converted + (j.notes? `\n\nNotes: ${j.notes}`: ''))
  }
  return (
    <section className="max-w-5xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-semibold text-white mb-4">Code Converter</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/10">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input value={source_language} onChange={e=>setSrc(e.target.value)} className="px-3 py-2 rounded bg-slate-900/60 text-white border border-white/10" />
            <input value={target_language} onChange={e=>setTgt(e.target.value)} className="px-3 py-2 rounded bg-slate-900/60 text-white border border-white/10" />
          </div>
          <textarea value={code} onChange={e=>setCode(e.target.value)} rows={10} className="w-full px-3 py-2 rounded bg-slate-900/60 text-white border border-white/10" />
          <div className="mt-3 flex justify-end">
            <button onClick={convert} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">Convert</button>
          </div>
        </div>
        <pre className="bg-slate-900/70 p-4 rounded-xl border border-white/10 text-blue-200 whitespace-pre-wrap">{result}</pre>
      </div>
    </section>
  )
}

function Progress({ user }) {
  const [data, setData] = useState(null)
  const completeLesson = async () => {
    if (!user) return
    await fetch(`${backendBase}/api/progress`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({user_id: user.user_id, course: 'Foundations', lesson: 'Intro', completed: true})})
    load()
  }
  const load = async () => {
    if (!user) return
    const r = await fetch(`${backendBase}/api/progress/${user.user_id}`)
    const j = await r.json(); setData(j)
  }
  useEffect(()=>{ load() }, [user])
  return (
    <section className="max-w-3xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-semibold text-white mb-2">Your Progress</h2>
      {!user ? <p className="text-blue-300">Sign in to track progress.</p> : (
        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/10">
          <p className="text-white">Completed: {data?.completed ?? 0}</p>
          <p className="text-white mt-1">Rank: {data?.rank ?? '—'}</p>
          <button onClick={completeLesson} className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded">Mark Intro Complete</button>
        </div>
      )}
    </section>
  )
}

function Auth({ onAuth }) {
  const [name, setName] = useState('Student')
  const [email, setEmail] = useState('student@example.com')
  const signUp = async () => {
    const r = await fetch(`${backendBase}/api/auth/signup`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name, email, provider: 'email'})})
    const j = await r.json(); onAuth(j)
  }
  const login = async () => {
    const r = await fetch(`${backendBase}/api/auth/login`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email})})
    const j = await r.json(); onAuth(j)
  }
  return (
    <section className="max-w-3xl mx-auto px-6 py-8">
      <div className="bg-slate-800/50 p-4 rounded-xl border border-white/10">
        <h3 className="text-white font-semibold mb-3">Get Started</h3>
        <div className="grid md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-blue-300 text-sm mb-1">Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-900/60 text-white border border-white/10" />
          </div>
          <div>
            <label className="block text-blue-300 text-sm mb-1">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-900/60 text-white border border-white/10" />
          </div>
          <div className="flex gap-2">
            <button onClick={signUp} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded w-full">Sign up</button>
            <button onClick={login} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded w-full">Log in</button>
          </div>
        </div>
      </div>
    </section>
  )
}

function App() {
  const [section, setSection] = useState('Home')
  const [user, setUser] = useState(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-blue-200">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]" />
      <Header onNav={setSection} />
      {section === 'Home' && (<>
        <Hero onStart={()=>setSection('Videos')} />
        <Auth onAuth={setUser} />
      </>)}
      {section === 'Videos' && <Videos />}
      {section === 'Notes' && <Notes user={user} onCreated={()=>{}} />}
      {section === 'Mentor' && <Mentor />}
      {section === 'Convert' && <Converter />}
      {section === 'Progress' && <Progress user={user} />}
      <footer className="border-t border-white/10 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-8 text-sm text-blue-300">Built for learners • Uses your backend for data and AI helpers</div>
      </footer>
    </div>
  )
}

export default App
