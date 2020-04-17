import "react";
import { createStore } from "redux";
import { Provider } from "react-redux";
import { reducer } from "data/store";
import Main from "components/Main";

const store = createStore(reducer);

export default function Index() {
  return (
    <Provider store={store}>
      <Main />
    </Provider>
  );
}
