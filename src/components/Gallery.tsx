import { useMemo, useState } from "react";
import DishImage from "./DishImage";
import { menuItems, menuNotice } from "../lib/menu";
import { groupMenuItems, filterAndSortMenu, type GallerySort } from "../lib/gallery.mjs";

type Layout = "cards" | "list";

export default function Gallery() {
  const [layout, setLayout] = useState<Layout>("cards");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<GallerySort>("code-asc");
  const entries = useMemo(
    () => groupMenuItems(menuItems.filter((item) => item.enabled !== false)),
    [],
  );
  const visible = useMemo(
    () => filterAndSortMenu(entries, search, sort),
    [entries, search, sort],
  );

  return (
    <section className="gallery">
      <div className="section-eyebrow">MENU GALLERY</div>
      <h1>メニュー一覧</h1>
      <p className="gallery-intro">注文番号を確認しながら、登録済みメニューを閲覧できます。</p>

      <div className="gallery-controls">
        <div className="gallery-search">
          <label htmlFor="gallery-search">商品名・注文番号で検索</label>
          <input id="gallery-search" type="search" value={search}
            placeholder="例：ミラノ風ドリア / 3901"
            onChange={(event) => setSearch(event.target.value)} />
        </div>
        <div className="gallery-sort">
          <label htmlFor="gallery-sort">並び替え</label>
          <select id="gallery-sort" value={sort}
            onChange={(event) => setSort(event.target.value as GallerySort)}>
            <option value="code-asc">注文番号：昇順</option>
            <option value="code-desc">注文番号：降順</option>
            <option value="name-asc">商品名：昇順</option>
            <option value="name-desc">商品名：降順</option>
          </select>
        </div>
      </div>

      <div className="gallery-toolbar">
        <p className="gallery-count" role="status">{visible.length} / {entries.length} 件</p>
        <div className="gallery-layout" role="group" aria-label="表示形式">
          <button type="button" className={layout === "cards" ? "is-active" : ""}
            aria-pressed={layout === "cards"} onClick={() => setLayout("cards")}>カード</button>
          <button type="button" className={layout === "list" ? "is-active" : ""}
            aria-pressed={layout === "list"} onClick={() => setLayout("list")}>リスト</button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="gallery-empty">
          <strong>該当するメニューがありません</strong>
          <p>商品名や注文番号を変えて検索してください。</p>
          <button className="button button-primary" type="button" onClick={() => setSearch("")}>
            検索をクリア
          </button>
        </div>
      ) : (
        <div className={"gallery-items " + (layout === "cards" ? "gallery-cards" : "gallery-list")}>
          {visible.map((item) => (
            <article className="gallery-item" key={item.groupId}>
              <div className="gallery-item-photo">
                <DishImage src={item.imageSource} name={item.name} />
              </div>
              <div className="gallery-item-detail">
                <div className="gallery-codes" aria-label={item.name + " の注文番号"}>
                  {item.codes.map((entry) => (
                    <span className="gallery-code-entry" key={entry.code}>
                      {entry.label && <small>{entry.label}</small>}
                      <strong className="gallery-code">{entry.code}</strong>
                    </span>
                  ))}
                </div>
                <h2>{item.name}</h2>
                {menuNotice(item) && <p className="gallery-menu-notice">{menuNotice(item)}</p>}
                {item.pageUrl ? (
                  <a href={item.pageUrl} target="_blank" rel="noopener noreferrer">
                    公式ページを見る ↗
                  </a>
                ) : item.sourceUrl ? (
                  <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                    番号の参照資料を見る ↗
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="gallery-disclaimer">画像を確認できない商品は「画像なし」で表示します。2026年2月の資料に基づく候補・朝サイゼ・季節商品は、現在の販売状況や対象店舗を確認してください。</p>
    </section>
  );
}
