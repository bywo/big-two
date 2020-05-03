import React, { useEffect } from "react";

const emojiMapping: { [k: string]: string } = {
  c: "♣️",
  d: "♦️",
  h: "♥️",
  s: "♠️",
};

const iconMapping: { [k: string]: string } = {
  c: "/icons/club.svg",
  d: "/icons/diamond.svg",
  h: "/icons/heart.svg",
  s: "/icons/spade.svg",
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
  if (card === "unknown") {
    return (
      <img src="/icons/card-back.svg" style={{ width: 68, height: 100 }} />
    );
  }
  return (
    <span
      style={{
        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
        width: 68,
        height: 100,
        border: "solid 1px #ccc",
        borderRadius: 8,
        background: card === "unknown" ? "gray" : selected ? "#ccc" : "white",
        fontFamily: "Fredoka One",
        color: suit === "h" || suit === "d" ? "#ff6464" : "#515262",
        fontSize: "24px",
      }}
    >
      <span>
        <img src={iconMapping[suit]} style={{ height: 18, marginRight: 3 }} />
        {rank}
      </span>
    </span>
  );
}
