import { render, screen, userEvent } from "."
import App from "../src/App"
import { test, expect, vi, describe } from "vitest"

test("Displays product name.", async () => {
  render(<App />)
  const title = screen.getByText("Tatamicord")
  expect(title).toBeDefined()
})

test("Landing page shows login button.", async () => {
  render(<App />)
  screen.getByText("Login")
})

test("Landing page shows register button.", async () => {
  render(<App />)
  screen.getByText("Register")
})

const buttonSpy = vi.fn()

describe("Button Routing Tests", () => {
  vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom")
    return {
      ...actual,
      useNavigate: () => buttonSpy,
    }
  })

  test("Login button brings user to login page.", async () => {
    render(<App />)
    const button = screen.getByText("Login")
    await userEvent.click(button)
    expect(buttonSpy).toHaveBeenCalledWith("/login")
  })

  test("Register button brings user to register page.", async () => {
    render(<App />)
    const button = screen.getByText("Register")
    await userEvent.click(button)
    expect(buttonSpy).toHaveBeenCalledWith("/register")
  })
})
