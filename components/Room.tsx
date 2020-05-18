import { v4 as uuid } from "uuid";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { init } from "../redux-swarm";

import userDb from "../clients/userDb";
import { Store } from "redux";
import Main from "./Main";
import { reducer } from "data/store";

function useBrowserId() {
  const [id, setId] = useState<string>();

  useEffect(() => {
    async function setup() {
      let id: string | undefined;
      try {
        id = await userDb.get("id");
      } catch (e) {
        if (e.notFound) {
          id = uuid();
          await userDb.put("id", id);
        } else {
          throw e;
        }
      }

      setId(id);
    }

    setup();
  }, []);

  return id;
}

export default function Room({ roomId }: { roomId: string }) {
  const browserId = useBrowserId();
  const [store, setStore] = useState<Store<any, any>>();

  useEffect(() => {
    if (!browserId) return;

    const { store, cleanup } = init(browserId, roomId, reducer);
    setStore(store);

    window.addEventListener("beforeunload", cleanup);

    return () => {
      window.removeEventListener("beforeunload", cleanup);
      cleanup();
    };
  }, [browserId, roomId]);

  return browserId && store ? (
    <Provider store={store}>
      <Main browserId={browserId} />
    </Provider>
  ) : null;
}
