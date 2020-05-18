import { createStore, Action, Reducer } from "redux";
import debounce from "lodash/debounce";
const signalhub = require("signalhub");
var swarm = require("webrtc-swarm");
const level = require("level");
const pump = require("pump");
const through = require("through2");
const Buffer = require("buffer/").Buffer;
import promisifyAll from "../util/promisifyAll";
import topologicalSort from "util/topologicalSort";

declare global {
  interface Window {
    hub: any;
    sw: any;
    log: any;
    nodes: any;
  }
}

interface HyperlogNode {
  key: string;
  links: string[];
  value: Buffer;
}

interface ParsedNode extends HyperlogNode {
  value: any;
}

export function init<S, A extends Action>(
  peerId: string,
  roomId: string,
  reducer: Reducer<S, A>
) {
  type StateUpdate = {
    type: "stateUpdate";
    payload: S;
  };

  type InternalAction = StateUpdate;

  function internalReducer(state: S | undefined, action: InternalAction): S {
    if (action.type === "stateUpdate") {
      return action.payload;
    }
    console.log("unexpected action", action);
    return reducer(state, action as any);
  }
  const store = createStore(internalReducer);

  const hyperlog = require("hyperlog");

  const hub = signalhub(roomId, ["https://signalhub-jccqtwhdwc.now.sh/"]);

  const db = level(roomId);
  const log = promisifyAll(hyperlog(db));

  const nodes: { [key: string]: ParsedNode } = {};
  window.nodes = nodes;
  const onChange = debounce(async () => {
    const heads = await log.headsAsync();
    console.log("heads", heads);
    let orderedNodes: ParsedNode[] | undefined;
    try {
      orderedNodes = await topologicalSort(
        nodes,
        heads.map((h: HyperlogNode) => h.key)
      );
    } catch (e) {
      if (e.missingKey) {
        const node: HyperlogNode = await log.getAsync(e.missingKey);
        changesStream.emit("data", node);
        return;
      } else {
        throw e;
      }
    }

    if (!orderedNodes) return;

    let state: S | undefined;
    for (let i = orderedNodes.length - 1; i >= 0; i--) {
      const node = orderedNodes[i];
      const action = node.value && node.value.type ? node.value : undefined;
      if (!action) continue;

      state = reducer(state, action);
    }
    originalDispatch({ type: "stateUpdate", payload: state as S });
  }, 10);

  const changesStream = log.createReadStream({ live: true });
  changesStream.on("data", (node: HyperlogNode) => {
    let value = node.value.toString();
    console.log("log change", node, value);
    try {
      value = JSON.parse(value);
    } catch {}

    const parsedNode: ParsedNode = {
      ...node,
      value,
    };

    nodes[node.key] = parsedNode;
    onChange();
  });
  window.log = log;

  var sw = swarm(hub, {
    uuid: peerId,
  });

  sw.on("peer", function(peer: any, id: string) {
    console.log("connected to a new peer:", id);
    console.log("total peers:", sw.peers.length);

    const replicationStream = log.replicate({ live: true });
    replicationStream.on("end", () => {
      console.log("replication ended");
    });
    pump(peer, toBuffer(), replicationStream, peer);

    peer.on("data", (data: any) => {
      // got a data channel message
      console.log(`got a message from peer ${id}: `, data);
    });
  });

  sw.on("disconnect", function(peer: any, id: string) {
    console.log("disconnected from a peer:", id);
    console.log("total peers:", sw.peers.length);
  });

  window.sw = sw;

  const originalDispatch = store.dispatch.bind(store);
  store.dispatch = ((action: any) => {
    log.append(JSON.stringify(action));
  }) as any;

  return {
    store,
    cleanup: () => {
      console.log("cleanup, calling swarm.close()");
      sw.close();
    },
  };
}

function toBuffer() {
  return through.obj(function(buf: any, enc: string, next: Function) {
    next(null, Buffer.isBuffer(buf) ? buf : Buffer(buf));
  });
}
