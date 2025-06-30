import { BrowserRouter } from "react-router-dom";
import { render } from "."
import { test } from "vitest";
import RegisterPage from "../src/components/Register";

test("Register page renders", async () => {
  render(
    <BrowserRouter>
      <RegisterPage />
    </BrowserRouter>
  )
})