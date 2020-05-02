import { produce } from "immer";
import { Reducer } from "redux";
import {
  TypedUseSelectorHook,
  useSelector as originalUseSelector,
} from "react-redux";

import last from "lodash/last";
import shuffle from "lodash/shuffle";
import range from "lodash/range";
import without from "lodash/without";

import { Card, standardDeck } from "util/cards";

interface State {
  currentPlayer: number;
  lastPlayerToPlayACombo: number | undefined;
  rounds: Card[][][];

  hands: Card[][];

  usernames: { [browserId: string]: string };
  playerOrder: string[];
}

interface DealAction {
  type: "deal";
  payload: {
    playerOrder: string[];
    hands: Card[][];
  };
}
export function deal(playerOrder: string[]): DealAction {
  const numPlayers = playerOrder.length;
  const shuffled = shuffle(standardDeck);
  const hands: Card[][] = range(numPlayers).map(() => []);
  for (let i = 0; i < shuffled.length; i++) {
    const hand = hands[i % numPlayers];
    if (hand.length < 13) {
      hand.push(shuffled[i]);
    }
  }

  return {
    type: "deal",
    payload: {
      playerOrder,
      hands,
    },
  };
}

interface PlaceAction {
  type: "place";
  payload: {
    player: number;
    combo: Card[];
  };
}

export function place(player: number, combo: Card[]): PlaceAction {
  return {
    type: "place",
    payload: {
      player,
      combo,
    },
  };
}

interface PassAction {
  type: "pass";
  payload: {
    player: number;
  };
}

export function pass(player: number): PassAction {
  return {
    type: "pass",
    payload: {
      player,
    },
  };
}

interface ClaimUsernameAction {
  type: "claimUsername";
  payload: {
    browserId: string;
    username: string;
  };
}

const initialState: State = {
  currentPlayer: 0,
  lastPlayerToPlayACombo: undefined,
  rounds: [],
  hands: [],
  usernames: {},
  playerOrder: [],
};

export type Action =
  | DealAction
  | PlaceAction
  | PassAction
  | ClaimUsernameAction;

export const reducer: Reducer<State, Action> = produce(
  (state: State, action: Action) => {
    if (action.type === "deal") {
      state.playerOrder = action.payload.playerOrder;
      state.hands = action.payload.hands;
      state.currentPlayer = 0;
      state.rounds = [[]];
    } else if (action.type === "place") {
      state.hands[state.currentPlayer] = without(
        state.hands[state.currentPlayer],
        ...action.payload.combo
      );
      state.currentPlayer =
        (action.payload.player + 1) % state.playerOrder.length;
      state.lastPlayerToPlayACombo = action.payload.player;

      let latestRound = last(state.rounds);
      if (!latestRound) {
        latestRound = [];
        state.rounds.push(latestRound);
      }
      latestRound.push(action.payload.combo);
    } else if (action.type === "pass") {
      state.currentPlayer =
        (action.payload.player + 1) % state.playerOrder.length;
      if (state.currentPlayer === state.lastPlayerToPlayACombo) {
        // everyone passed. new round!
        state.rounds.push([]);
      }
    } else if (action.type === "claimUsername") {
      if (!Object.values(state.usernames).includes(action.payload.username)) {
        state.usernames[action.payload.browserId] = action.payload.username;
      }
    }
  },
  initialState
);

export const useSelector: TypedUseSelectorHook<State> = originalUseSelector;
