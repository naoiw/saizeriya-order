import { useCallback, useRef, useState } from "react";
import DishImage from "./DishImage";
import { drawGacha } from "../lib/gacha.mjs";
import { menuItems, type MenuItem } from "../lib/menu";

const PICK_COUNT = 5;
const LAST_DRAW_KEY = "saizeriya-order:last-gacha-v1";
const availableItems = menuItems.filter((item) => item.enabled !== false);

// crypto.getRandomValues uses fresh entropy even for rapid rerolls and F5.
// Unlike a fixed seed, it cannot replay the same sequence on every reload.
function randomFraction(): number {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0] / 0x100000000;
  }
  return Math.random();
}

function readPreviousDraw(): string[] {
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(LAST_DRAW_KEY) ?? "null");
    return Array.isArray(parsed) && parsed.every((code) => typeof code === "string")
      ? parsed : [];
  } catch {
    // Storage may be disabled in private / restricted browsers.
    return [];
  }
}

function writePreviousDraw(codes: string[]) {
  try {
    sessionStorage.setItem(LAST_DRAW_KEY, JSON.stringify(codes));
  } catch {
    // Drawing still works without storage; in-memory repetition is prevented.
  }
}

export default function Gacha() {
  const [picks, setPicks] = useState<MenuItem[]>([]);
  const previousRef = useRef<string[]>([]);

  const roll = useCallback(() => {
    if (availableItems.length === 0) return;
    const previous = previousRef.current.length ? previousRef.current : readPreviousDraw();
    const next = drawGacha(availableItems, PICK_COUNT, randomFraction, previous);
    const codes = next.map((item) => item.code);
    previousRef.current = codes;
    writePreviousDraw(codes);
    setPicks(next);
  }, []);

  return (
    <section className="gacha">
      <div className="section-eyebrow">MENU GACHA</div>
      <h1>メニューガチャ</h1>
      <p className="gacha-intro">
        お店で何を注文するか迷ったら、運任せで5品。<strong>重複あり</strong>で抽選します。
        同じ商品が複数回出たら、その数だけ注文するルールです。
      </p>
      <div className="gacha-action">
        <button type="button" className="button button-primary" onClick={roll}
          disabled={availableItems.length === 0}>
          <span aria-hidden="true">🎲</span> {picks.length ? "もう一度ガチャを回す" : "ガチャを回す"}
        </button>
        <span className="gacha-counter" role="status">
          {availableItems.length === 0
            ? "抽選対象がありません"
            : picks.length > 0
              ? "抽選結果：5品（重複あり）"
              : "ボタンを押すと5品を抽選します"}
        </span>
      </div>
      {picks.length > 0 && (
        <ol className="gacha-items" aria-label="ガチャで選ばれた5品">
          {picks.map((item, index) => (
            <li key={index} className="gacha-item">
              <span className="gacha-index" aria-label={index + 1 + "品目"}>{index + 1}</span>
              <div className="gacha-image">
                <DishImage key={item.code} src={item.imageSource} name={item.name} />
              </div>
              <div className="gacha-detail">
                <strong className="gacha-item-name">{item.name}</strong>
                {item.variantLabel && <span className="gacha-variant">{item.variantLabel}</span>}
                <span className="gacha-code">注文番号 <strong>{item.code}</strong></span>
              </div>
            </li>
          ))}
        </ol>
      )}
      <p className="gacha-note">
        抽選対象はクイズと同じ有効メニューです。ページ更新後は再びボタンを押すと抽選します。
        直前と5件すべてが同じ順番になることは避けています。
      </p>
    </section>
  );
}
