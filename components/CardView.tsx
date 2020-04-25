import React, { useEffect } from "react";

const emojiMapping: { [k: string]: string } = {
  c: "♣️",
  d: "♦️",
  h: "♥️",
  s: "♠️",
};

export default function CardView({ card }: { card: string }) {
  useEffect(() => {
    return () => {
      debugger;
    };
  }, []);
  const suit = card[0];
  const rank = card.slice(1);
  return <span>{`${emojiMapping[suit]}${rank}`}</span>;
}
