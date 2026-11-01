import { useEffect, useState } from "react";
import Gallery from "./components/Gallery";
import Gacha from "./components/Gacha";
import Quiz from "./components/Quiz";

type View = "quiz" | "gacha" | "gallery";

function viewFromHash(): View {
  const hash = window.location.hash;
  return hash === "#gacha" ? "gacha" : hash === "#gallery" ? "gallery" : "quiz";
}

export default function App() {
  const [view, setView] = useState<View>(viewFromHash);

  useEffect(() => {
    const syncHash = () => setView(viewFromHash());
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const switchView = (next: View) => {
    // Preserve the selected mode across F5 and allow direct #gacha links.
    window.history.replaceState(null, "", "#" + next);
    setView(next);
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="./" aria-label="SAIZERIYA ORDER ホーム">SAIZERIYA ORDER</a>
          <nav className="main-nav" aria-label="モード切替">
            <button type="button" className={view === "quiz" ? "active" : ""}
              aria-current={view === "quiz" ? "page" : undefined} onClick={() => switchView("quiz")}>クイズ</button>
            <button type="button" className={view === "gacha" ? "active" : ""}
              aria-current={view === "gacha" ? "page" : undefined} onClick={() => switchView("gacha")}>ガチャ</button>
            <button type="button" className={view === "gallery" ? "active" : ""}
              aria-current={view === "gallery" ? "page" : undefined} onClick={() => switchView("gallery")}>ギャラリー</button>
          </nav>
        </div>
      </header>
      <main className="main-content">
        {view === "quiz" ? <Quiz /> : view === "gacha" ? <Gacha /> : <Gallery />}
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <span>SAIZERIYA ORDER</span>
          <a className="github-link" href="https://github.com/naoiw/saizeriya-order"
            target="_blank" rel="noopener noreferrer" aria-label="GitHubでソースコードを開く">GitHub ↗</a>
        </div>
      </footer>
    </div>
  );
}
