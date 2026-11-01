import { menuItems } from "./lib/menu";

export default function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">SAIZERIYA ORDER</div>
          <a className="github-link" href="https://github.com/naoiw/saizeriya-order" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
        </div>
      </header>
      <main className="main-content">
        <div className="eyebrow">PROJECT SETUP</div>
        <h1>注文番号クイズ</h1>
        <p className="intro">メニューの写真と商品名から、4桁の注文番号を当てるゲームです。現在は商品データと画像収集の基盤を整備しています。</p>
        <div className="stats">
          <section className="stat">
            <span className="stat-label">登録済みの商品</span>
            <strong>{menuItems.length}<small> 件</small></strong>
          </section>
          <section className="stat">
            <span className="stat-label">回答形式</span>
            <strong>4<small> 桁</small></strong>
          </section>
        </div>
        <section className="section">
          <h2>データセット</h2>
          <p>公式の人気メニューから商品名・注文番号・画像の取得元を管理します。画像ファイルはローカルに保存し、GitHubには含めません。</p>
          <div className="sample-table" role="table" aria-label="初期データセット">
            {menuItems.map((item) => (
              <div className="sample-row" role="row" key={item.code}>
                <span role="cell" className="sample-code">{item.code}</span>
                <span role="cell" className="sample-name">{item.name}</span>
                <a role="cell" href={item.pageUrl} target="_blank" rel="noopener noreferrer" aria-label={`${item.name}の公式ページ`}>公式 ↗</a>
              </div>
            ))}
          </div>
          <p className="note">商品写真は <code>npm run collect:menu</code> で取得します。初期画面では商品データの確認のみ可能です。</p>
        </section>
        <section className="section">
          <h2>実装予定</h2>
          <div className="planned">
            <div><strong>10問クイズ</strong><span>画像・商品名を見て、キーパッドから4桁を回答</span></div>
            <div><strong>ギャラリー</strong><span>商品画像のカード・リスト表示、検索</span></div>
          </div>
        </section>
      </main>
      <footer className="site-footer"><div className="footer-inner"><span>SAIZERIYA ORDER</span><span>Unofficial personal project</span></div></footer>
    </div>
  );
}
