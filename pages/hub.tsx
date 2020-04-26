import { useEffect } from "react";
const signalhub = require("signalhub");
var swarm = require("webrtc-swarm");
const level = require("level");
const pump = require("pump");
const through = require("through2");
const Buffer = require("buffer/").Buffer;

declare global {
  interface Window {
    hub: any;
    sw: any;
    log: any;
  }
}

export default function Hub() {
  useEffect(() => {
    const hyperlog = require("hyperlog");

    const hub = signalhub("big-two", ["https://signalhub-jccqtwhdwc.now.sh/"]);

    hub.subscribe("my-channel").on("data", function(message: any) {
      console.log("new message received", message);
    });

    hub.broadcast("my-channel", { hello: "world" });
    window.hub = hub;

    const topic = "asdfasdf";

    const db = level(topic);
    const log = hyperlog(db);

    const changesStream = log.createReadStream({ live: true });
    changesStream.on("data", (node: any) => {
      console.log("log change", node);
    });
    window.log = log;

    var sw = swarm(hub);

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
  }, []);

  return <div />;
}

function toBuffer() {
  return through.obj(function(buf: any, enc: string, next: Function) {
    next(null, Buffer.isBuffer(buf) ? buf : Buffer(buf));
  });
}
