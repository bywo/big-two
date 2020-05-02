import * as _ from "lodash";
import topologicalSort from "./topologicalSort";
const level = require("level");
const hyperlog = require("hyperlog");
import promisifyAll from "../util/promisifyAll";

function getPromisifiedHyperlog(...args: any[]) {
  const log = promisifyAll(hyperlog(...args));

  // subscribe to all node additions
  log.allNodes = [];
  log.createReadStream({ live: true }).on("data", (node: any) => {
    log.allNodes.push(node);
  });

  return log;
}

async function sortNodesOfLog(log: any) {
  return (
    (
      await topologicalSort(
        _.keyBy(log.allNodes, "key"),
        (await log.headsAsync()).map((node: any) => node.key)
      )
    )
      // the `change` key is unique to each copy of the hyperlog
      .map((node: any) => _.omit(node, "change"))
  );
}

describe("topologicalSort", () => {
  it("sorts DAG into a list", async () => {
    // example borrowed from wiki article: https://en.wikipedia.org/wiki/Topological_sorting
    const nodes = [
      {
        key: "05",
        links: ["11"],
      },
      {
        key: "07",
        links: ["11", "08"],
      },
      {
        key: "03",
        links: ["08", "10"],
      },
      {
        key: "11",
        links: ["02", "09", "10"],
      },
      {
        key: "08",
        links: ["09"],
      },
      {
        key: "02",
        links: [],
      },
      {
        key: "09",
        links: [],
      },
      {
        key: "10",
        links: [],
      },
    ];

    const sorted = await topologicalSort(_.keyBy(nodes, "key"), [
      "05",
      "07",
      "03",
    ]);

    expect(sorted.map((node) => node.key)).toEqual([
      "07",
      "05",
      "11",
      "03",
      "10",
      "08",
      "09",
      "02",
    ]);
  });

  describe("with hyperlog entries", () => {
    const dbA = level("dbA");
    const dbB = level("dbB");
    const dbC = level("dbC");
    beforeEach(async () => {
      await dbA.clear();
      await dbB.clear();
      await dbC.clear();
    });
    it("works", async () => {
      // log A and B both append a value before starting replication
      const logA = getPromisifiedHyperlog(dbA);
      await logA.appendAsync("a1");

      const logB = getPromisifiedHyperlog(dbB);
      await logB.appendAsync("b1");

      const sA = logA.replicate({ live: true });
      const sB = logB.replicate({ live: true });
      sA.pipe(sB).pipe(sA);

      await new Promise((resolve) => setTimeout(resolve, 30));

      expect(await sortNodesOfLog(logA)).toEqual(await sortNodesOfLog(logB));

      // log A appends after replication has started
      await logA.appendAsync("a2");

      await new Promise((resolve) => setTimeout(resolve, 30));
      let latestLogViewFromA = await sortNodesOfLog(logA);

      expect(latestLogViewFromA).toEqual(await sortNodesOfLog(logB));
      expect(latestLogViewFromA[0].value.toString("utf8")).toEqual("a2");

      // log C appends a value before starting replication and only replicates with A
      const logC = getPromisifiedHyperlog(dbC);
      await logC.appendAsync("c1");

      const sA2 = logA.replicate({ live: true });
      const sC = logC.replicate({ live: true });
      sA2.pipe(sC).pipe(sA2);

      await new Promise((resolve) => setTimeout(resolve, 30));
      expect(await sortNodesOfLog(logC)).toEqual(await sortNodesOfLog(logB));
      expect(
        (await sortNodesOfLog(logC))[0].value.toString("utf8")
      ).not.toEqual("c1");
    });
  });
});
