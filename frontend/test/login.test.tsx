import { BrowserRouter } from "react-router-dom"
import { render, screen, userEvent } from "."
import LoginPage from "../src/components/Login"
import { test, expect, describe, vi } from "vitest"

test("Login page renders.", async () => {
  render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  )
  const username = screen.getByText("Username")
  expect(username).toBeDefined()
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

  test("Clicking the logo goes to homepage.", async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )
    const button = screen.getByText("Tatamicord")
    await userEvent.click(button)
    expect(buttonSpy).toHaveBeenCalledWith("/")
  })

  test("Create an account button goes to register page.", async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )
    const button = screen.getByText("Create an account")
    await userEvent.click(button)
    expect(buttonSpy).toHaveBeenCalledWith("/register")
  })
})