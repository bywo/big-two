import { useDispatch } from "react-redux";
import { deal, useSelector, place, pass } from "data/store";
import last from "lodash/last";
import { useState } from "react";
import produce from "immer";
import { Card, isValidPlay } from "util/cards";

export default function Main() {
  const state = useSelector((state) => state);
  const dispatch = useDispatch();
  const latestRound = last(state.rounds);
  const lastCombo = latestRound && last(latestRound);
  return (
    <div>
      <div>
        {!state.hands.length && (
          <button onClick={() => dispatch(deal(2))}>Deal</button>
        )}
        <div style={{ display: "flex" }}>
          {state.hands[0] && (
            <Hand
              style={{ flex: 1 }}
              hand={state.hands[0]}
              isCurrentTurn={state.currentPlayer === 0}
              onPlace={(combo) => {
                if (isValidPlay(lastCombo, combo)) {
                  dispatch(place(0, combo));
                } else {
                  alert("invalid play");
                }
              }}
              onPass={() => dispatch(pass(0))}
            />
          )}
          <div style={{ flex: 1 }}>
            Latest play:{" "}
            {lastCombo?.map((c) => (
              <CardView card={c} />
            ))}
          </div>
          {state.hands[1] && (
            <Hand
              style={{ flex: 1 }}
              hand={state.hands[1]}
              isCurrentTurn={state.currentPlayer === 1}
              onPlace={(combo) => {
                if (isValidPlay(lastCombo, combo)) {
                  dispatch(place(1, combo));
                } else {
                  alert("invalid play");
                }
              }}
              onPass={() => dispatch(pass(1))}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Hand({
  hand,
  style,
  isCurrentTurn,
  onPlace,
  onPass,
}: {
  hand: Card[];
  isCurrentTurn: boolean;
  style: React.CSSProperties;
  onPlace: (combo: Card[]) => void;
  onPass: () => void;
}) {
  const [selectedCards, setSelectedCards] = useState<{ [k: string]: true }>({});
  return (
    <div
      style={{ background: isCurrentTurn ? "yellow" : "transparent", ...style }}
    >
      {hand.map((card) => (
        <div
          style={{ background: selectedCards[card] ? "green" : "transparent" }}
          onClick={() => {
            if (selectedCards[card]) {
              setSelectedCards(
                produce(selectedCards, (draft) => {
                  delete draft[card];
                })
              );
            } else {
              setSelectedCards({
                ...selectedCards,
                [card]: true,
              });
            }
          }}
        >
          <CardView card={card} />
        </div>
      ))}
      {isCurrentTurn ? (
        <div>
          <button
            onClick={() => {
              onPlace(Object.keys(selectedCards));
              setSelectedCards({});
            }}
          >
            Play
          </button>
          <button onClick={() => onPass()}>Pass</button>
        </div>
      ) : null}
    </div>
  );
}

const emojiMapping: { [k: string]: string } = {
  c: "♣️",
  d: "♦️",
  h: "♥️",
  s: "♠️",
};

function CardView({ card }: { card: string }) {
  const suit = card[0];
  const rank = card.slice(1);
  return <span>{`${emojiMapping[suit]}${rank}`}</span>;
}
