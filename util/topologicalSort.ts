import * as _ from "lodash";

interface Node {
  key: string;
  links: string[];
}

// Kahn's algorithm with lexographic tiebreakers on `key`
export default async function topologicalSort(
  nodes: { [key: string]: Node },
  heads: string[]
): Promise<Node[]> {
  const ret: Node[] = [];
  const edgesYetToBeTraversed: {
    [key: string]: { [key: string]: boolean };
  } = {};
  for (const { key, links } of Object.values(nodes)) {
    for (const link of links) {
      edgesYetToBeTraversed[link] = edgesYetToBeTraversed[link] || {};
      edgesYetToBeTraversed[link][key] = true;
    }
  }

  let currentHeads: string[] = heads.slice();
  while (currentHeads.length) {
    const tip = _.max(currentHeads) as string;
    currentHeads = _.without(currentHeads, tip);
    const node = nodes[tip];
    ret.push(node);

    for (const link of node.links) {
      delete edgesYetToBeTraversed[link][tip];
      if (_.size(edgesYetToBeTraversed[link]) === 0) {
        currentHeads.push(link);
      }
    }
  }

  return ret;
}
