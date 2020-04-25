import "react";
import { createStore } from "redux";
import { Provider } from "react-redux";
import { reducer } from "data/store";
import Main from "components/Main";
import { useEffect } from "react";
import { useRouter } from "next/router";

const IPFS = require("ipfs");
const OrbitDB = require("orbit-db");

if (typeof window != "undefined") {
  window.LOG = "orbit*";
}

const store = createStore(reducer);

declare global {
  interface Window {
    ipfs: any;
    orbitdb: any;
    db: any;
    LOG?: string;
  }
}

const dbAddress =
  "/orbitdb/zdpuB1PsYMn8XY2prCRNkYRW65oWuirJA2DgTGQuyLddjtCZJ/first-database";

let shouldLog = false;

export default function Index() {
  const { query } = useRouter();
  useEffect(() => {
    async function init() {
      // Create IPFS instance
      const ipfs = await IPFS.create({
        // preload: { enabled: false },
        // config: {
        //   Addresses: {
        //     Swarm: [
        //       "/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star",
        //     ],
        //   },
        // },
        config: {
          Addresses: {
            Swarm: [
              // "/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star",
              // "/ip4/127.0.0.1/tcp/9090/ws/p2p-webrtc-star",
              "/dns4/star-signal.cloud.ipfs.team/tcp/9090/wss/p2p-webrtc-star",
            ],
          },
        },
        relay: { enabled: true, hop: { enabled: true, active: true } },
        EXPERIMENTAL: { pubsub: true },
      });

      window.ipfs = ipfs;

      const pubsubRet = await ipfs.pubsub.subscribe(dbAddress, (m: any) =>
        console.log("pubsub received", m)
      );
      console.log("pubsubRet", pubsubRet);
      // setInterval(() => {
      //   if (shouldLog) {
      //     ipfs.pubsub.publish(dbAddress, "hello world");
      //   }
      // }, 2000);

      // ipfs.on("error", (e: any) => console.log("ipfs error", e));
      // ipfs.on("ready", () => console.log("ipfs ready"));

      // Create OrbitDB instance
      const orbitdb = await OrbitDB.createInstance(ipfs);
      console.log("orbitdb", orbitdb);
      window.orbitdb = orbitdb;
      const db = await orbitdb.log(dbAddress, {
        // Give write access to everyone
        accessController: {
          write: ["*"],
        },
      });
      db.events.on("peer", (peer: any) => {
        console.log("new peer on pubsub", peer);
      });
      // const db = await orbitdb.open(dbAddress);
      await db.load();
      console.log("db", db);
      db.events.on("replicated", () => {
        const result = db
          .iterator({ limit: -1 })
          .collect()
          .map((e: any) => e.payload.value);
        console.log("replicated", result);
      });

      window.db = db;
    }

    init();
  }, []);

  useEffect(() => {
    console.log("query change", query);
    if (query.send) {
      shouldLog = true;
    }
  }, [query]);

  return (
    <Provider store={store}>
      <Main />
    </Provider>
  );
}
