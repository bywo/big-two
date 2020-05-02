import { useDispatch } from "react-redux";
import { Action, deal, useSelector, place, pass } from "data/store";
import last from "lodash/last";
import { useState } from "react";
import produce from "immer";
import { Card, isValidPlay, toValue } from "util/cards";
import CardView from "./CardView";
import { Dispatch } from "redux";
import sortBy from "lodash/sortBy";

export default function Main({ browserId }: { browserId: string }) {
  const state = useSelector((state) => state);
  const dispatch: Dispatch<Action> = useDispatch();
  const latestRound = last(state.rounds);
  const lastCombo = latestRound && last(latestRound);

  const [usernameInputValue, setUsernameInputValue] = useState("");

  const username = state.usernames[browserId];
  return (
    <div>
      {!username ? (
        <div>
          What's your name?{" "}
          <input
            type="text"
            value={usernameInputValue}
            onChange={(e) => setUsernameInputValue(e.target.value)}
          />
          <button
            onClick={() => {
              dispatch({
                type: "claimUsername",
                payload: { browserId, username: usernameInputValue },
              });
            }}
          >
            Save
          </button>
        </div>
      ) : (
        <div>Username: {username}</div>
      )}
      <div>People in room: {Object.values(state.usernames).join(", ")}</div>
      <div>Players: {state.playerOrder.join(", ")}</div>
      <div>
        {!state.hands.length && (
          <button
            onClick={() => dispatch(deal(Object.values(state.usernames)))}
          >
            Deal
          </button>
        )}
        {state.hands.map((hand, i) => {
          const playerName = state.playerOrder[i];
          const isMe = username === playerName;

          return (
            <Hand
              style={{ flex: 1 }}
              isMe={isMe}
              hand={hand}
              isCurrentTurn={state.currentPlayer === i}
              onPlace={(combo) => {
                if (isValidPlay(lastCombo, combo)) {
                  dispatch(place(i, combo));
                } else {
                  alert("invalid play");
                }
              }}
              onPass={() => dispatch(pass(i))}
            />
          );
        })}
        <div style={{ flex: 1 }}>
          Latest play:{" "}
          {lastCombo?.map((c) => (
            <CardView card={c} selected={false} />
          ))}
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
  isMe,
}: {
  hand: Card[];
  isCurrentTurn: boolean;
  style: React.CSSProperties;
  onPlace: (combo: Card[]) => void;
  onPass: () => void;
  isMe: boolean;
}) {
  const [selectedCards, setSelectedCards] = useState<{ [k: string]: true }>({});
  const sortedHand = sortBy(hand, toValue);
  return (
    <div
      style={{ background: isCurrentTurn ? "yellow" : "transparent", ...style }}
    >
      {sortedHand.map((card) => (
        <div
          key={card}
          style={{
            display: "inline-block",
            background: selectedCards[card] ? "green" : "transparent",
          }}
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
          <CardView
            card={isMe ? card : "unknown"}
            selected={selectedCards[card]}
          />
        </div>
      ))}
      {isCurrentTurn && isMe ? (
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
