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
  numPlayers: number;
  currentPlayer: number;
  lastPlayerToPlayACombo: number | undefined;
  rounds: Card[][][];

  hands: Card[][];
}

interface DealAction {
  type: "deal";
  payload: {
    hands: Card[][];
  };
}
export function deal(numPlayers: number): DealAction {
  const shuffled = shuffle(standardDeck);
  const hands: Card[][] = range(numPlayers).map(() => []);
  for (let i = 0; i < shuffled.length; i++) {
    hands[i % numPlayers].push(shuffled[i]);
  }

  return {
    type: "deal",
    payload: {
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

const initialState: State = {
  numPlayers: 0,
  currentPlayer: 0,
  lastPlayerToPlayACombo: undefined,
  rounds: [],
  hands: [],
};

type Action = DealAction | PlaceAction | PassAction;

export const reducer: Reducer<State, Action> = produce(
  (state: State, action: Action) => {
    if (action.type === "deal") {
      state.hands = action.payload.hands;
      state.numPlayers = state.hands.length;
      state.currentPlayer = 0;
      state.rounds = [[]];
    } else if (action.type === "place") {
      state.hands[state.currentPlayer] = without(
        state.hands[state.currentPlayer],
        ...action.payload.combo
      );
      state.currentPlayer = (action.payload.player + 1) % state.numPlayers;
      state.lastPlayerToPlayACombo = action.payload.player;

      let latestRound = last(state.rounds);
      if (!latestRound) {
        latestRound = [];
        state.rounds.push(latestRound);
      }
      latestRound.push(action.payload.combo);
    } else if (action.type === "pass") {
      state.currentPlayer = (action.payload.player + 1) % state.numPlayers;
      if (state.currentPlayer === state.lastPlayerToPlayACombo) {
        // everyone passed. new round!
        state.rounds.push([]);
      }
    }
  },
  initialState
);

export const useSelector: TypedUseSelectorHook<State> = originalUseSelector;
