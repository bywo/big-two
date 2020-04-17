import { createStore } from "redux";
import { reducer, deal, place, pass } from "./store";
import _ from "lodash";
import { standardDeck } from "util/cards";

describe("big two gameplay", () => {
  let store = createStore(reducer);
  beforeEach(() => {
    store = createStore(reducer);
  });

  it("deals cards", () => {
    store.dispatch(deal(4));
    const state = store.getState();

    expect(state.hands).toHaveLength(4);

    for (const hand of state.hands) {
      expect(hand).toHaveLength(13);
    }

    expect(_.sortBy(_.flatten(state.hands))).toEqual(_.sortBy(standardDeck));
  });

  it("handles placing a combo", () => {
    store.dispatch({
      type: "deal",
      payload: {
        hands: [
          ["♠️A", "♠️3"],
          ["♠️4", "♥️A"],
        ],
      },
    });

    store.dispatch(place(0, ["♠️3"]));

    expect(store.getState()).toEqual(
      expect.objectContaining({
        currentPlayer: 1,
        lastPlayerToPlayACombo: 0,
        rounds: [[["♠️3"]]],
        hands: [["♠️A"], ["♠️4", "♥️A"]],
      })
    );

    store.dispatch(place(1, ["♠️4"]));

    expect(store.getState()).toEqual(
      expect.objectContaining({
        currentPlayer: 0,
        lastPlayerToPlayACombo: 1,
        rounds: [[["♠️3"], ["♠️4"]]],
        hands: [["♠️A"], ["♥️A"]],
      })
    );
  });

  it("handles passing a turn", () => {
    store.dispatch({
      type: "deal",
      payload: {
        hands: [
          ["♠️A", "♠️3"],
          ["♠️4", "♥️A"],
        ],
      },
    });

    store.dispatch(place(0, ["♠️3"]));
    store.dispatch(pass(1));

    expect(store.getState()).toEqual(
      expect.objectContaining({
        currentPlayer: 0,
        lastPlayerToPlayACombo: 0,
        rounds: [[["♠️3"]], []],
        hands: [["♠️A"], ["♠️4", "♥️A"]],
      })
    );
  });
});
