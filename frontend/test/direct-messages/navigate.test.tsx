import { BrowserRouter } from "react-router-dom";
import { render, screen, userEvent } from ".."
import HomePage from "../../src/routes/Home";
import { test, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { setupServer } from "msw/node"
import { http, HttpResponse } from "msw"

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

test("User can see friends.", async () => {
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
  expect(receiver).toBeDefined()
})
