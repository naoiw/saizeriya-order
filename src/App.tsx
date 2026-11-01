import Quiz from "./components/Quiz";

export default function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="./" aria-label="SAIZERIYA ORDER ホーム">SAIZERIYA ORDER</a>
          <a className="github-link" href="https://github.com/naoiw/saizeriya-order"
            target="_blank" rel="noopener noreferrer">GitHub ↗</a>
        </div>
      </header>
      <main className="main-content">
        <Quiz />
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <span>SAIZERIYA ORDER</span><span>Unofficial personal project</span>
        </div>
      </footer>
    </div>
  );
}
