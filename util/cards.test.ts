import { isStraight, isFlush, isFullHouse, isFourOfAKind } from "./cards";

describe("cards util", () => {
  describe("#isStraight", () => {
    it("return true for a valid 5-card straight", () => {
      expect(isStraight(["h5", "c6", "s7", "d8", "h9"])).toEqual(true);
    });

    it("return false for an invalid straight", () => {
      expect(isStraight(["h5", "c6", "s3", "d8", "h9"])).toEqual(false);
    });
  });

  describe("#isFlush", () => {
    it("return true for a valid 5-card flush", () => {
      expect(isFlush(["h5", "h2", "h4", "hK", "h9"])).toEqual(true);
    });

    it("return false for an invalid flush", () => {
      expect(isFlush(["h5", "c6", "s3", "d8", "h9"])).toEqual(false);
    });
  });

  describe("#isFullHouse", () => {
    it("return true for a valid 5-card flush", () => {
      expect(isFullHouse(["h5", "s5", "c5", "hK", "cK"])).toEqual(true);
    });

    it("return false for an invalid flush", () => {
      expect(isFullHouse(["h5", "c6", "s3", "d8", "h9"])).toEqual(false);
    });
  });

  describe("#isFourOfAKind", () => {
    it("return true for a valid 5-card flush", () => {
      expect(isFourOfAKind(["h5", "s5", "c5", "d5", "cK"])).toEqual(true);
    });

    it("return false for an invalid flush", () => {
      expect(isFourOfAKind(["h5", "c6", "s3", "d8", "h9"])).toEqual(false);
    });
  });
});
