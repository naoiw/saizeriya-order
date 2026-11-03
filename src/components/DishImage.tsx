import { useState } from "react";

type DishImageProps = {
  src?: string;
  name: string;
  onFailure?: () => void;
  loading?: "eager" | "lazy";
};

export default function DishImage({
  src,
  name,
  onFailure,
  loading = "lazy",
}: DishImageProps) {
  const [failed, setFailed] = useState(false);
  if (!src) {
    return (
      <div className="dish-image-fallback dish-image-missing" role="img"
        aria-label={name + "：画像なし"}>
        <span>画像なし</span>
      </div>
    );
  }
  if (failed) {
    return (
      <div className="dish-image-fallback" role="img" aria-label={name + "の画像を表示できません"}>
        <span aria-hidden="true">▧</span>
        <span>画像を表示できません</span>
      </div>
    );
  }
  return (
    <img
      className="dish-image"
      src={src}
      alt={name}
      loading={loading}
      onError={() => {
        setFailed(true);
        onFailure?.();
      }}
    />
  );
}
