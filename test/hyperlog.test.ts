const level = require("level");
const hyperlog = require("hyperlog");
import { promisify } from "util";

describe("hyperlog", () => {
  const dbA = level("dbA");
  const dbB = level("dbB");
  beforeEach(async () => {
    // const it = level("dbA").iterator();
    // it.next((node: any) => {
    //   console.log("iterator", node);
    //   next();
    // });
    try {
      await dbA.clear();
      await dbB.clear();
    } catch (e) {
      console.log("clear err", e);
    }
  });

  it("blah", async () => {
    const logA = hyperlog(dbA);
    logA.createReadStream({ live: true }).on("data", (node: any) => {
      console.log("logA stream", node);
    });
    const logAAppend = promisify(logA.append.bind(logA));
    const logAHeads = promisify(logA.heads.bind(logA));

    await logAAppend("a1");
    let heads = await logAHeads();
    console.log("a heads", heads);

    const logB = hyperlog(dbB);
    logB.createReadStream({ live: true }).on("data", (node: any) => {
      console.log("logB stream", node);
    });
    const logBAppend = promisify(logB.append.bind(logB));
    const logBHeads = promisify(logB.heads.bind(logB));
    await logBAppend("b1");
    heads = await logBHeads();
    console.log("b heads", heads);

    const sA = logA.replicate();
    const sB = logB.replicate();

    sA.pipe(sB).pipe(sA);

    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    console.log("a heads", await logAHeads());
    console.log("b heads", await logBHeads());
  });
});
