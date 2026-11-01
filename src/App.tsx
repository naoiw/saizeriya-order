import { useState } from "react";
import { menuItems, type MenuItem } from "./lib/menu";

function MenuPreview({ item }: { item: MenuItem }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="sample-row" role="row">
      <div className="sample-photo" role="cell">
        {failed ? (
          <span className="image-fallback">画像を表示できません</span>
        ) : (
          <img src={item.imageSource} alt={item.name} loading="lazy"
            width={88} height={64} onError={() => setFailed(true)} />
        )}
      </div>
      <span role="cell" className="sample-code">{item.code}</span>
      <span role="cell" className="sample-name">{item.name}</span>
      <a role="cell" href={item.pageUrl} target="_blank" rel="noopener noreferrer"
        aria-label={item.name + "の公式ページ"}>公式 ↗</a>
    </div>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">SAIZERIYA ORDER</div>
          <a className="github-link" href="https://github.com/naoiw/saizeriya-order"
            target="_blank" rel="noopener noreferrer">GitHub ↗</a>
        </div>
      </header>
      <main className="main-content">
        <div className="eyebrow">PROJECT SETUP</div>
        <h1>注文番号クイズ</h1>
        <p className="intro">メニューの写真と商品名から、4桁の注文番号を当てるゲームです。現在は商品データと公式画像URLを管理する基盤を整備しています。</p>
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
          <h2>データセット確認</h2>
          <p>公式サイトの画像URLを直接参照しています。画像が表示できない商品がないか確認してください。ゲーム・ギャラリー機能は今後追加します。</p>
          <div className="sample-table" role="table" aria-label="商品データと写真">
            {menuItems.map((item) => <MenuPreview key={item.code} item={item} />)}
          </div>
          <p className="note">画像はサイゼリヤ公式サイトから読み込まれます。ネットワーク環境や公式サイト側の制限によって表示できない場合があります。</p>
        </section>
        <section className="section">
          <h2>実装予定</h2>
          <div className="planned">
            <div><strong>10問クイズ</strong><span>画像・商品名を見て、キーパッドから4桁を回答</span></div>
            <div><strong>ギャラリー</strong><span>商品画像のカード・リスト表示、検索</span></div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <span>SAIZERIYA ORDER</span>
          <span>Unofficial personal project</span>
        </div>
      </footer>
    </div>
  );
}
