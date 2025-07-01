import { BrowserRouter } from "react-router-dom"
import { render, screen, userEvent } from "."
import LoginPage from "../src/components/Login"
import { test, expect, describe, vi, beforeEach, beforeAll, afterAll } from "vitest"
import dotenv from "dotenv"
import { setupServer } from "msw/node"
import { http, HttpResponse } from "msw"

dotenv.config()
const server = setupServer()

test("Login page renders.", async () => {
  render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  )
  const email = screen.getByText("Email")
  expect(email).toBeDefined()
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
  beforeAll(() => {
    server.listen()
  }) 
  afterAll(() => {
    server.close()
  })
  beforeEach(() => {
    server.resetHandlers()
  })

  test("Clicking the logo goes to landing page.", async () => {
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

  test("A valid login goes to homepage.", async () => {
    server.use(
      http.post(process.env.API_URL! + '/login/', async () => {
        return HttpResponse.json({
          "result": "fake-jwt-lol"
        })
      })
    )
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )
    const email = screen.getByText("Email")
    await userEvent.type(email, "tatami@frontend.com")
    const password = screen.getByText("Password")
    await userEvent.type(password, "tatami")
    const button = screen.getByText("Sign In")
    await userEvent.click(button)
    expect(buttonSpy).toHaveBeenCalledWith("/home")
  })

  test("An invalid login does not go to homepage.", async () => {
    server.use(
      http.post(process.env.API_URL! + '/login/', async () => {
        return new HttpResponse(null, {status: 401})
      })
    )
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )
    const email = screen.getByText("Email")
    await userEvent.type(email, "tatami@frontend.com")
    const password = screen.getByText("Password")
    await userEvent.type(password, "tatami")
    const button = screen.getByText("Sign In")
    await userEvent.click(button)
    screen.getByText("Login")  // change to "Invalid Credentials!" later
  })
})
