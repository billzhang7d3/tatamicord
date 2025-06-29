import { render, screen } from "."
import App from "../src/App"
import { test, expect } from "vitest"

test("Displays product name.", () => {
  render(<App />)
  const title = screen.getByText("Tatamicord")
  expect(title).toBeDefined()
});

test("landing page shows login button", async () => {
  render(<App />)
  screen.getByText("Login")
})

test("landing page shows register button", async () => {
  render(<App />)
  screen.getByText("Register")
})