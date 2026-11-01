import { useState } from "react";
import Gallery from "./components/Gallery";
import Gacha from "./components/Gacha";
import Quiz from "./components/Quiz";

type View = "quiz" | "gacha" | "gallery";

export default function App() {
  const [view, setView] = useState<View>("quiz");

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="./" aria-label="SAIZERIYA ORDER ホーム">SAIZERIYA ORDER</a>
          <nav className="main-nav" aria-label="モード切替">
            <button type="button" className={view === "quiz" ? "active" : ""}
              aria-current={view === "quiz" ? "page" : undefined} onClick={() => setView("quiz")}>クイズ</button>
            <button type="button" className={view === "gacha" ? "active" : ""}
              aria-current={view === "gacha" ? "page" : undefined} onClick={() => setView("gacha")}>ガチャ</button>
            <button type="button" className={view === "gallery" ? "active" : ""}
              aria-current={view === "gallery" ? "page" : undefined} onClick={() => setView("gallery")}>ギャラリー</button>
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
