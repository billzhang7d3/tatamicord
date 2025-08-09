import { BrowserRouter } from "react-router-dom";
import { render, screen, userEvent } from ".."
import HomePage from "../../src/routes/Home";
import { test, expect, beforeAll, beforeEach, afterAll, vi } from "vitest";
import { setupServer } from "msw/node"
import { http, HttpResponse } from "msw"

const server = setupServer()

const buttonSpy = vi.fn()

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => buttonSpy
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

test("Homepage renders.", async () => {
  server.use(
    http.get(import.meta.env.VITE_API_URL! + 'timeline/', async () => {
      return HttpResponse.json([])
    }),
    http.get(import.meta.env.VITE_API_URL! + 'direct-message/', async () => {
      return HttpResponse.json([])
    }),
  )
  render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  )
  const text = await screen.findByText("Home")
  expect(text).toBeDefined()
})

test("Switching timelines works.", async () => {
  server.use(
    http.get(import.meta.env.VITE_API_URL! + 'timeline/', async () => {
      return HttpResponse.json([{
        id: "fake-uuid-1",
        name: "Galaxy",
        owner: "me",
        default_channel: "none"
      }, {
        id: "fake-uuid-2",
        name: "Mantine",
        owner: "me",
        default_channel: "none"
      }])
    }),
    http.get(import.meta.env.VITE_API_URL! + 'direct-message/', async () => {
      return HttpResponse.json([])
    }),
  )
  render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  )
  const home = await screen.findByText("Home")
  await userEvent.click(home)
  const galaxy = await screen.findByText("Galaxy")
  expect(galaxy).toBeDefined()
  await userEvent.click(galaxy)
  expect(buttonSpy).toHaveBeenCalledWith("/timeline/fake-uuid-1/none")
})

