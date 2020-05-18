import { useDispatch } from "react-redux";
import { Action, deal, useSelector, place, pass } from "data/store";
import last from "lodash/last";
import { useState, ButtonHTMLAttributes } from "react";
import produce from "immer";
import { Card, isValidPlay, toValue } from "util/cards";
import CardView from "./CardView";
import Button from "./Button";
import { Dispatch } from "redux";
import sortBy from "lodash/sortBy";
import range from "lodash/range";

function rotate<T>(arr: T[], num: number): T[] {
  return [...arr.slice(num), ...arr.slice(0, num)];
}

export default function Main({ browserId }: { browserId: string }) {
  const state = useSelector((state) => state);
  const dispatch: Dispatch<Action> = useDispatch();
  const latestRound = last(state.rounds);
  const lastCombo = latestRound && last(latestRound);

  const [usernameInputValue, setUsernameInputValue] = useState("");

  const username = state.usernames[browserId];

  const winnerIndex = state.hands.findIndex((hand) => hand.length === 0);
  const winnerName =
    winnerIndex !== -1 ? state.playerOrder[winnerIndex] : undefined;

  // rotate the render order such that my player is the bottom-most
  const myIndex = state.playerOrder.findIndex((name) => name === username);
  const renderOrder =
    myIndex !== -1
      ? rotate(range(state.playerOrder.length), myIndex - 1)
      : range(state.playerOrder.length);
  console.log("myIndex", myIndex, renderOrder);
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
      {winnerName ? (
        <div
          style={{
            fontFamily: "Fredoka One",
            fontSize: "24px",
            color: "#515262",
          }}
        >
          {winnerName} wins!
        </div>
      ) : null}
      <div>
        {(!state.hands.length || winnerName) && (
          <Button
            onClick={() => dispatch(deal(Object.values(state.usernames)))}
          >
            Deal
          </Button>
        )}
        <div style={{ flex: 1 }}>
          Latest play:{" "}
          {lastCombo ? (
            lastCombo.map((c) => <CardView card={c} selected={false} />)
          ) : (
            <CardView card="unknown" />
          )}
        </div>
        {renderOrder.map((i) => {
          const hand = state.hands[i];
          const playerName = state.playerOrder[i];
          const isMe = username === playerName;

          return (
            <div>
              <div>{playerName}</div>
              <Hand
                style={{ flex: 1 }}
                isMe={isMe}
                hand={hand}
                isCurrentTurn={!winnerName && state.currentPlayer === i}
                onPlace={(combo) => {
                  if (isValidPlay(lastCombo, combo)) {
                    dispatch(place(i, combo));
                  } else {
                    alert("invalid play");
                  }
                }}
                onPass={() => dispatch(pass(i))}
              />
            </div>
          );
        })}
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
    <div>
      <div
        style={{
          background: isCurrentTurn ? "#cfc" : "transparent",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          paddingTop: 20,
          ...style,
        }}
      >
        {sortedHand.map((card) => (
          <div
            key={card}
            style={{
              display: "inline-block",
              marginRight: -10,
              marginTop: -20,
              transition: "transform 150ms",
              transform: `translateY(${
                selectedCards[card] ? -10 : 0
              }px) rotate(2deg)`,
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
      </div>
      {isCurrentTurn && isMe ? (
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 24 }}
        >
          <Button
            buttonType="main"
            onClick={() => {
              onPlace(Object.keys(selectedCards));
              setSelectedCards({});
            }}
          >
            Play
          </Button>
          <div style={{ width: 12 }} />
          <Button buttonType="secondary" onClick={() => onPass()}>
            Pass
          </Button>
        </div>
      ) : null}
    </div>
  );
}
