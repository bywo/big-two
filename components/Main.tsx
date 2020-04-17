import { useDispatch } from "react-redux";
import { Card, deal, useSelector, place, pass } from "data/store";
import last from "lodash/last";
import { useState } from "react";
import produce from "immer";

export default function Main() {
  const state = useSelector((state) => state);
  const dispatch = useDispatch();
  const latestRound = last(state.rounds);
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
              onPlace={(combo) => dispatch(place(0, combo))}
              onPass={() => dispatch(pass(0))}
            />
          )}
          <div style={{ flex: 1 }}>
            Latest play: {latestRound && last(latestRound)}
          </div>
          {state.hands[1] && (
            <Hand
              style={{ flex: 1 }}
              hand={state.hands[1]}
              isCurrentTurn={state.currentPlayer === 1}
              onPlace={(combo) => dispatch(place(1, combo))}
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
          {card}
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
