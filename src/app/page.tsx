export default function Home() {
  return (
    <div style={{ 
      background: '#09090b', 
      color: 'white', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #4f8cff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
        CIKEN AI 🚀
      </h1>
      <p style={{ color: '#a1a1aa', marginTop: '1rem', fontSize: '1.2rem' }}>
        Your AI Coding Assistant is live!
      </p>
      <div style={{ marginTop: '2rem', padding: '1rem 2rem', background: '#18181b', borderRadius: '0.75rem', border: '1px solid #27272a' }}>
        <code style={{ color: '#4f8cff' }}>fatahciken.vercel.app</code>
      </div>
    </div>
  );
}
