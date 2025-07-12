import { BrowserRouter } from "react-router-dom";
import { render, screen, userEvent } from "."
import { afterAll, beforeAll, beforeEach, expect, test, vi } from "vitest";
import RegisterPage from "../src/components/Register";
import { setupServer } from "msw/node"
import { http, HttpResponse } from "msw";
import { describe } from "node:test";

const server = setupServer()

beforeAll(() => {
  server.listen()
}) 
afterAll(() => {
  server.close()
})
beforeEach(() => {
  server.resetHandlers()
})

test("Register page renders", async () => {
  render(
    <BrowserRouter>
      <RegisterPage />
    </BrowserRouter>
  )
})

test("Successfully register for an account", async () => {
  server.use(
    http.post(import.meta.env.VITE_API_URL! + 'register/', async () => {
        return HttpResponse.json({
          "result": "Successfully Registered"
        })
    })
  )
  render(
    <BrowserRouter>
      <RegisterPage />
    </BrowserRouter>
  )
  const email = screen.getByText("Email")
  await userEvent.type(email, "tatami@frontend.com")
  const username = screen.getByText("Username")
  await userEvent.type(username, "tatami")
  const password = screen.getByText("Password")
  await userEvent.type(password, "tatami")
  const confirmPassword = screen.getByText("Confirm Password")
  await userEvent.type(confirmPassword, "tatami")
  const button = screen.getByText("Register")
  await userEvent.click(button)
  const message = screen.getByText("Account Creation Successful!")
  expect(message).toBeDefined()
})

test("Register with used email", async () => {
  server.use(
    http.post(import.meta.env.VITE_API_URL! + 'register/', async () => {
        return new HttpResponse(null, {status: 403})
    })
  )
  render(
    <BrowserRouter>
      <RegisterPage />
    </BrowserRouter>
  )
  const email = screen.getByText("Email")
  await userEvent.type(email, "tatami@frontend.com")
  const username = screen.getByText("Username")
  await userEvent.type(username, "tatami")
  const password = screen.getByText("Password")
  await userEvent.type(password, "tatami")
  const confirmPassword = screen.getByText("Confirm Password")
  await userEvent.type(confirmPassword, "tatami")
  const button = screen.getByText("Register")
  await userEvent.click(button)
  const message = screen.getByText("Email address already in use")
  expect(message).toBeDefined()
})

test("Register with fully occupied username", async () => {
  server.use(
    http.post(import.meta.env.VITE_API_URL! + 'register/', async () => {
        return new HttpResponse(null, {status: 409})
    })
  )
  render(
    <BrowserRouter>
      <RegisterPage />
    </BrowserRouter>
  )
  const email = screen.getByText("Email")
  await userEvent.type(email, "tatami@frontend.com")
  const username = screen.getByText("Username")
  await userEvent.type(username, "tatami")
  const password = screen.getByText("Password")
  await userEvent.type(password, "tatami")
  const confirmPassword = screen.getByText("Confirm Password")
  await userEvent.type(confirmPassword, "tatami")
  const button = screen.getByText("Register")
  await userEvent.click(button)
  const message = screen.getByText("Username already taken")
  expect(message).toBeDefined()
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

  test("Sign In button goes to login page.", async () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    )
    const button = screen.getByText("Sign In")
    await userEvent.click(button)
    expect(buttonSpy).toHaveBeenCalledWith("/login")
  })
})
