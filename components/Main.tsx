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
import { darkGray, primary } from "./shared";
import without from "lodash/without";

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
      ? rotate(range(state.playerOrder.length), myIndex + 1)
      : range(state.playerOrder.length);
  console.log("myIndex", myIndex, renderOrder);
  if (!username) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2 style={{ padding: 0, margin: 0, fontSize: "30px" }}>
          What's your name?
        </h2>
        <div style={{ height: 24 }} />
        <input
          style={{
            fontFamily: "Fredoka One",
            fontSize: "24px",
            lineHeight: "24px",
            padding: "10px 20px",
            borderRadius: 50,
            outline: 0,
            border: 0,
            color: darkGray,
            textAlign: "center",
          }}
          type="text"
          value={usernameInputValue}
          onChange={(e) => setUsernameInputValue(e.target.value)}
        />
        <div style={{ height: 12 }} />
        <Button
          onClick={() => {
            dispatch({
              type: "claimUsername",
              payload: { browserId, username: usernameInputValue },
            });
          }}
        >
          Save
        </Button>
      </div>
    );
  }

  const otherAttendees = without(Object.values(state.usernames), username);
  let otherAttendeesText = "";
  if (otherAttendees.length === 1) {
    otherAttendeesText = `${otherAttendees[0]} is here`;
  } else if (otherAttendees.length === 2) {
    otherAttendeesText = `${otherAttendees[0]} and ${otherAttendees[1]} are here`;
  } else if (otherAttendees.length) {
    otherAttendeesText = `${otherAttendees
      .slice(0, otherAttendees.length - 1)
      .join(", ")}, and ${otherAttendees[otherAttendees.length - 1]} are here`;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div>Invite friends with this link: {window.location.href}</div>
      {otherAttendees.length ? (
        <div>{otherAttendeesText}</div>
      ) : (
        <div>Nobody else is here</div>
      )}
      {winnerName ? (
        <div
          style={{
            fontFamily: "Fredoka One",
            fontSize: "24px",
            color: "#515262",
            marginTop: 20,
          }}
        >
          {winnerName} wins!
        </div>
      ) : null}
      {(!state.hands.length || winnerName) && (
        <Button
          style={{ marginTop: 20 }}
          disabled={otherAttendees.length === 0}
          onClick={() =>
            dispatch(deal(Object.values(state.usernames).slice(0, 4)))
          }
        >
          Deal
        </Button>
      )}
      <div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 30,
          }}
        >
          {lastCombo ? (
            <SetOfCards cards={lastCombo} />
          ) : (
            <CardView card="unknown" />
          )}
          Discard pile
        </div>
        {renderOrder.map((i) => {
          const hand = state.hands[i];
          const playerName = state.playerOrder[i];
          const isMe = username === playerName;

          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginTop: 30,
              }}
            >
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
              <div>
                {playerName}
                {isMe ? " (You)" : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SetOfCards({ cards }: { cards: Card[] }) {
  return (
    <div>
      {cards.map((card) => (
        <div
          key={card}
          style={{
            display: "inline-block",
            marginRight: -10,
            marginTop: -20,
            transition: "transform 150ms",
            transform: `rotate(2deg)`,
          }}
        >
          <CardView card={card} />
        </div>
      ))}
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
          background: isCurrentTurn ? primary : "transparent",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          padding: 20,
          paddingTop: 30,
          borderRadius: 30,
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
