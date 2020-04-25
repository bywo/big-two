// NOTE: jest-dom adds handy assertions to Jest and is recommended, but not required
import "@testing-library/jest-dom";

import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import CardView from "./CardView";

test.only("shows the children when the checkbox is checked", async () => {
  const start = Date.now();
  render(<CardView card="h4" />);
  expect(screen.getByText("♥️4")).toBeInTheDocument();
  console.log("time", Date.now() - start);
});
