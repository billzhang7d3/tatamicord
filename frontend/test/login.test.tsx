import { render, screen } from "."
import App from "../src/App"
import { test, expect } from "vitest"

test("renders", () => {
  render(<App />)
  const text = screen.getByText("App")
  expect(text).toBeDefined()
});
