const level = require("level");
const hyperlog = require("hyperlog");
import { promisify } from "util";

describe("hyperlog", () => {
  const dbA = level("dbA");
  const dbB = level("dbB");
  const dbC = level("dbC");
  beforeEach(async () => {
    // const it = level("dbA").iterator();
    // it.next((node: any) => {
    //   console.log("iterator", node);
    //   next();
    // });
    try {
      await dbA.clear();
      await dbB.clear();
      await dbC.clear();
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

    const sA = logA.replicate({ live: true });
    const sB = logB.replicate({ live: true });

    sA.pipe(sB).pipe(sA);

    const logC = hyperlog(dbC);
    logC.createReadStream({ live: true }).on("data", (node: any) => {
      console.log("logC stream", node);
    });
    const logCAppend = promisify(logC.append.bind(logC));
    const logCHeads = promisify(logC.heads.bind(logC));

    const sA2 = logA.replicate({ live: true });
    const sC = logC.replicate({ live: true });
    sA2.pipe(sC).pipe(sA2);

    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    console.log("a heads", await logAHeads());
    console.log("b heads", await logBHeads());
    console.log("c heads", await logCHeads());

    await logAAppend("a2");
    console.log("a heads", await logAHeads());
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    console.log("b heads", await logBHeads());
  });
});
