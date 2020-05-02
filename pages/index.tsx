import "react";
import { createStore } from "redux";
import { Provider } from "react-redux";
import { reducer } from "data/store";
import Main from "components/Main";
import { useEffect } from "react";
import { useRouter, Router } from "next/router";
import Room from "components/Room";
import Lobby from "components/Lobby";
import { v4 as uuid } from "uuid";

const store = createStore(reducer);

export default function Index() {
  const router = useRouter();

  const { roomId } = router.query || {};

  if (roomId) {
    const singleRoomId = Array.isArray(roomId) ? roomId[0] : roomId;
    return <Room roomId={singleRoomId} />;
  }

  return (
    <Lobby
      createRoom={() => {
        const roomId = uuid();
        router.push(`/?roomId=${roomId}`);
      }}
    />
  );
}
