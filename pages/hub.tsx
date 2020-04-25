import { useEffect } from "react";
const signalhub = require("signalhub");
var swarm = require("webrtc-swarm");

declare global {
  interface Window {
    hub: any;
    sw: any;
  }
}

export default function Hub() {
  useEffect(() => {
    const hub = signalhub("big-two", [
      "https://signalhub-jccqtwhdwc.now.sh/",
      // "https://signalhub-hzbibrznqa.now.sh/",
    ]);

    hub.subscribe("my-channel").on("data", function(message: any) {
      console.log("new message received", message);
    });

    hub.broadcast("my-channel", { hello: "world" });
    window.hub = hub;

    var sw = swarm(hub, {
      // config: {
      //   iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      // },
    });

    sw.on("peer", function(peer: any, id: string) {
      console.log("connected to a new peer:", id);
      console.log("total peers:", sw.peers.length);

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
