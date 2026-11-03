import { useCallback, useEffect, useState } from "react";
import { menuItems, menuNotice, type MenuItem } from "../lib/menu";
import {
  appendDigit,
  backspaceDigit,
  pickQuestions,
  scoreResults,
  type QuizResult,
} from "../lib/quiz.mjs";
import DishImage from "./DishImage";

const QUESTION_COUNT = 5;
const availableQuestions = menuItems.filter((item) => item.enabled !== false);
type Phase = "ready" | "playing" | "review" | "complete";

export default function Quiz() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [questions, setQuestions] = useState<MenuItem[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState<QuizResult[]>([]);
  const [imageFailed, setImageFailed] = useState(false);

  const current = questions[index];
  const previousResult = results[index];

  const start = () => {
    if (availableQuestions.length < QUESTION_COUNT) return;
    setQuestions(pickQuestions(availableQuestions, QUESTION_COUNT));
    setIndex(0);
    setAnswer("");
    setImageFailed(false);
    setResults([]);
    setPhase("playing");
  };

  const recordAnswer = useCallback((submitted: string | null) => {
    if (phase !== "playing" || !current) return;
    if (submitted !== null && submitted.length !== 4) return;
    const entry: QuizResult = {
      code: current.code,
      name: current.variantLabel ? current.name + "（" + current.variantLabel + "）" : current.name,
      answer: submitted,
      isCorrect: submitted === current.code,
    };
    setResults((existing) => [...existing, entry]);
    setPhase("review");
  }, [current, phase]);

  const next = useCallback(() => {
    if (phase !== "review") return;
    if (index + 1 === questions.length) {
      setPhase("complete");
    } else {
      setIndex((value) => value + 1);
      setAnswer("");
      setImageFailed(false);
      setPhase("playing");
    }
  }, [index, phase, questions.length]);

  useEffect(() => {
    if (phase !== "playing" && phase !== "review") return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, a")) return;
      if (phase === "review") {
        if (event.key === "Enter") {
          event.preventDefault();
          next();
        }
        return;
      }
      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        setAnswer((value) => appendDigit(value, event.key));
      } else if (event.key === "Backspace") {
        event.preventDefault();
        setAnswer(backspaceDigit);
      } else if (event.key === "Escape" || event.key === "Delete") {
        event.preventDefault();
        setAnswer("");
      } else if (event.key === "Enter" && answer.length === 4) {
        event.preventDefault();
        recordAnswer(answer);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, answer, recordAnswer, next]);

  if (phase === "ready") {
    return (
      <section className="quiz-intro">
        <div className="section-eyebrow">QUIZ MODE</div>
        <h1>注文番号クイズ</h1>
        <p className="lead">商品名（画像がある商品は写真も）から、4桁の注文番号を答えてください。</p>
        <div className="intro-stats">
          <div><strong>{QUESTION_COUNT}</strong><span>問 / 1回</span></div>
          <div><strong>{availableQuestions.length}</strong><span>登録メニュー</span></div>
        </div>
        <p className="hint-text">毎回ランダムに5問を出題します。回答後に正解を表示し、最後に結果をまとめて確認できます。</p>
        {availableQuestions.length < QUESTION_COUNT ? (
          <p role="alert" className="warning">開始には5件以上のメニューデータが必要です。</p>
        ) : (
          <button type="button" className="button button-primary start-button" onClick={start}>
            クイズをはじめる
          </button>
        )}
      </section>
    );
  }

  if (phase === "complete") {
    const score = scoreResults(results);
    return (
      <section className="quiz-results">
        <div className="section-eyebrow">RESULT</div>
        <h1>クイズ結果</h1>
        <div className="result-summary">
          <span>正解数</span>
          <strong>{score}<small> / {questions.length} 問</small></strong>
          <p>正答率 {Math.round(score / questions.length * 100)}%</p>
        </div>
        <h2>回答一覧</h2>
        <div className="result-list">
          {results.map((result, position) => (
            <div className="result-line" key={result.code}>
              <span className={result.isCorrect ? "result-mark correct" : "result-mark incorrect"}>
                {result.isCorrect ? "○" : "×"}
              </span>
              <span className="result-number">{String(position + 1).padStart(2, "0")}</span>
              <span className="result-dish">{result.name}</span>
              <span className="result-codes">
                <span>回答: {result.answer ?? "スキップ"}</span>
                <strong>正解: {result.code}</strong>
              </span>
            </div>
          ))}
        </div>
        <button type="button" className="button button-primary" onClick={start}>もう一度挑戦する</button>
      </section>
    );
  }

  if (!current) return null;

  return (
    <section className="quiz-play">
      <div className="quiz-progress">
        <span>QUESTION <strong>{String(index + 1).padStart(2, "0")}</strong> / {QUESTION_COUNT}</span>
        <span>{results.filter((result) => result.isCorrect).length} 問正解</span>
      </div>
      <div className="progress-track"><div style={{ width: (index / QUESTION_COUNT * 100) + "%" }} /></div>
      <div className="question-card">
        <div className="question-photo">
          <DishImage key={current.code} src={current.imageSource} name={current.name}
            loading="eager" onFailure={() => setImageFailed(true)} />
        </div>
        <h1 className="question-name">{current.name}</h1>
        {current.variantLabel && <p className="question-variant">{current.variantLabel}</p>}
        {menuNotice(current) && <p className="menu-notice">{menuNotice(current)}</p>}
        <p className="question-subtitle">このメニューの注文番号は？</p>
      </div>

      {phase === "playing" ? (
        <div className="answer-area">
          <div className="answer-display" role="group" aria-label="4桁の回答">
            {[0, 1, 2, 3].map((position) => (
              <span key={position} className={"answer-slot" + (answer.length === position ? " active" : "")}>
                {answer[position] ?? ""}
              </span>
            ))}
          </div>
          <div className="keypad" aria-label="数字キーパッド">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
              <button className="key" type="button" key={digit}
                disabled={answer.length === 4}
                onClick={() => setAnswer((value) => appendDigit(value, digit))}>{digit}</button>
            ))}
            <button className="key key-action" type="button" onClick={() => setAnswer("")}
              disabled={answer.length === 0}>クリア</button>
            <button className="key" type="button" disabled={answer.length === 4}
              onClick={() => setAnswer((value) => appendDigit(value, "0"))}>0</button>
            <button className="key key-action" type="button" aria-label="1桁削除"
              disabled={answer.length === 0} onClick={() => setAnswer(backspaceDigit)}>⌫</button>
          </div>
          <button type="button" className="button button-primary submit-button"
            disabled={answer.length !== 4} onClick={() => recordAnswer(answer)}>回答する</button>
          <p className="keyboard-hint">キーボード：数字入力 / Backspace 削除 / Enter 回答</p>
          {imageFailed && (
            <div className="image-warning" role="alert">
              画像を読み込めませんでした。
              <button type="button" className="link-button" onClick={() => recordAnswer(null)}>この問題をスキップ</button>
            </div>
          )}
        </div>
      ) : (
        <div className={"review-card " + (previousResult.isCorrect ? "review-correct" : "review-incorrect")}
          aria-live="polite">
          <span className="review-label">{previousResult.isCorrect ? "正解！" : previousResult.answer === null ? "スキップ" : "不正解"}</span>
          <div className="review-code"><span>正解の注文番号</span><strong>{current.code}</strong></div>
          {!previousResult.isCorrect && (
            <p>あなたの回答：{previousResult.answer ?? "スキップ"}</p>
          )}
          <button type="button" className="button button-primary" onClick={next}>
            {index + 1 === QUESTION_COUNT ? "結果を見る" : "次の問題へ"}
          </button>
          <p className="keyboard-hint">Enter キーでも次に進めます</p>
        </div>
      )}
    </section>
  );
}
