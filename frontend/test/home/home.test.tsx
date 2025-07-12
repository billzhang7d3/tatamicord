import { BrowserRouter } from "react-router-dom";
import { render } from ".."
import HomePage from "../../src/components/Home";
import { test } from "vitest";

test("renders (delete later xd)", () => {
  render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  )
})
