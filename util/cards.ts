import flatMap from "lodash/flatMap";
import uniq from "lodash/uniq";
import groupBy from "lodash/groupBy";
import sortBy from "lodash/sortBy";
import maxBy from "lodash/maxBy";

export type Card = string;

const CLUB = "c";
const DIAMOND = "d";
const HEART = "h";
const SPADE = "s";

export const standardDeck: Card[] = flatMap(
  [CLUB, DIAMOND, HEART, SPADE],
  (suit) =>
    flatMap(
      ["3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "2"],
      (rank) => `${suit}${rank}`
    )
);

const rankValues: { [rank: string]: number } = {
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
  2: 15,
};

const suitValues: { [suit: string]: number } = {
  [CLUB]: 0,
  [DIAMOND]: 1,
  [HEART]: 2,
  [SPADE]: 3,
};

export function toValue(cardOrPokerHand: Card | Card[]): number {
  if (Array.isArray(cardOrPokerHand)) {
    const hand = cardOrPokerHand;
    if (hand.length !== 5) {
      throw new Error("can only handle poker hands");
    }

    let handRank = 0;
    let secondaryRank = 0;
    let tertiaryRank = 0;
    if (isStraight(hand)) {
      if (isFlush(hand)) {
        // straight flush
        handRank = 5;
      } else {
        handRank = 1;
      }

      const highestCard = maxBy(hand, toValue) as string;
      secondaryRank = (toValue(highestCard) / 10) | 0;
      tertiaryRank = toValue(highestCard) % 10;
    } else if (isFlush(hand)) {
      handRank = 2;

      const highestCard = maxBy(hand, toValue) as string;
      secondaryRank = toValue(highestCard) % 10;
      tertiaryRank = (toValue(highestCard) / 10) | 0;
    } else if (isFullHouse(hand)) {
      handRank = 3;

      const groups = groupBy(hand.map((card) => (toValue(card) / 10) | 0));
      const sortedGroups = sortBy(Object.values(groups), "length");
      secondaryRank = sortedGroups[1][0];
    } else if (isFourOfAKind(hand)) {
      handRank = 4;
      const groups = groupBy(hand.map((card) => (toValue(card) / 10) | 0));
      const sortedGroups = sortBy(Object.values(groups), "length");
      secondaryRank = sortedGroups[1][0];
    }

    return handRank * 10000 + secondaryRank * 100 + tertiaryRank;
  } else {
    const card = cardOrPokerHand;
    const suit = card[0];
    const rank = card.slice(1);

    return rankValues[rank] * 10 + suitValues[suit];
  }
}

export function isStraight(cards: Card[]) {
  const sorted = sortBy(cards.map((card) => (toValue(card) / 10) | 0));
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] !== sorted[0] + i) {
      return false;
    }
  }
  return true;
}

export function isFlush(cards: Card[]) {
  const suits = cards.map((card) => toValue(card) % 10);
  return uniq(suits).length === 1;
}

export function isFullHouse(cards: Card[]) {
  const groups = groupBy(cards.map((card) => (toValue(card) / 10) | 0));
  const sortedGroups = sortBy(Object.values(groups), "length");
  return (
    sortedGroups.length === 2 &&
    sortedGroups[0].length === 2 &&
    sortedGroups[1].length === 3
  );
}

export function isFourOfAKind(cards: Card[]) {
  const groups = groupBy(cards.map((card) => (toValue(card) / 10) | 0));
  const sortedGroups = sortBy(Object.values(groups), "length");
  return (
    sortedGroups.length === 2 &&
    sortedGroups[0].length === 1 &&
    sortedGroups[1].length === 4
  );
}

export function isValidPlay(prev: Card[] | undefined, next: Card[]): boolean {
  if (!isValidCombo(next)) {
    return false;
  }

  if (!prev) {
    return true;
  }

  if (prev.length !== next.length) {
    return false;
  }

  if (prev.length === 1 || prev.length === 2 || prev.length === 3) {
    return (
      (maxBy(next.map(toValue)) as number) >
      (maxBy(prev.map(toValue)) as number)
    );
  } else {
    return toValue(next) > toValue(prev);
  }
}

function isValidCombo(combo: Card[]) {
  if (combo.length === 1) {
    return true;
  } else if (combo.length === 2 || combo.length === 3) {
    return uniq(combo.map((card) => card.slice(1))).length === 1;
  } else if (combo.length === 5) {
    return (
      isStraight(combo) ||
      isFlush(combo) ||
      isFullHouse(combo) ||
      isFourOfAKind(combo)
    );
  }
  return false;
}
