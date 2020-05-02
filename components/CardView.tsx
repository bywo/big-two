import React, { useEffect } from "react";

const emojiMapping: { [k: string]: string } = {
  c: "♣️",
  d: "♦️",
  h: "♥️",
  s: "♠️",
};

export default function CardView({
  card,
  selected,
}: {
  card: string;
  selected: boolean;
}) {
  const suit = card[0];
  const rank = card.slice(1);
  return (
    <span
      style={{
        display: "inline-block",
        padding: "20px 10px",
        border: "solid 1px gray",
        borderRadius: 10,
        background: card === "unknown" ? "gray" : selected ? "#ccc" : "white",
      }}
    >
      {card === "unknown" ? "??? " : `${emojiMapping[suit]}${rank}`}
    </span>
  );
}
