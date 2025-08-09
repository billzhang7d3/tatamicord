import { BrowserRouter, useNavigation } from "react-router-dom";
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

test("User can navigate from Home to another DM page", async () => {
  server.use(
    http.get(import.meta.env.VITE_API_URL! + 'timeline/', async () => {
      return HttpResponse.json([])
    }),
    http.get(import.meta.env.VITE_API_URL! + 'direct-message/', async () => {
      return HttpResponse.json([{
        id: "fake-id-lol",
        sender: "mock-sender",
        receiver: {
          id: "fake-id2-lol",
          tag: "1234",
          username: "mock-receiver"
        }
      }])
    }),
  )
  render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  )
  const burger = await screen.findByLabelText("menu")
  await userEvent.click(burger)
  const receiver = await screen.findByText("mock-receiver")
  await userEvent.click(receiver)
  expect(buttonSpy).toHaveBeenCalledWith("/direct-message/fake-id2-lol")
})
