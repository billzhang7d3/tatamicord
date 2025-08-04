import { BrowserRouter } from "react-router-dom";
import { render, screen, userEvent } from ".."
import { test, expect, beforeAll, beforeEach, afterAll, vi } from "vitest";
import { setupServer } from "msw/node"
import { http, HttpResponse } from "msw"
import DirectMessagePage from "../../src/routes/DirectMessage";

const server = setupServer()

Object.defineProperty(Element.prototype, "scrollTo", {
  value: vi.fn(),
  writable: true
})

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useParams: () => {
      return { id: "fake-id-lol" }
    },
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

test("User can send messages.", async () => {
  server.use(
    http.get(import.meta.env.VITE_API_URL! + 'timeline/', async () => {
      return HttpResponse.json([])
    }),
    http.get(import.meta.env.VITE_API_URL! + 'direct-message/', async () => {
      return HttpResponse.json([{
        id: "fake-id-lol",
        sender: "mock-sender",
        receiver: {
          id: "mock-receiver",
          tag: "1234",
          username: "abbey"
        }
      }])
    }),
    http.get(import.meta.env.VITE_API_URL! + "direct-message/:id", async () => {
      return HttpResponse.json([])
    }),
    http.post(import.meta.env.VITE_API_URL! + "direct-message/:id", async () => {
      return HttpResponse.json({
        id: "fake-message-id",
        location: "fake-message-location",
        sender: {
          id: "mock-receiver",
          tag: "1234",
          username: "julia"
        },
        content: "half of what I say is meaningless"
      })
    })
  )
  render(
    <BrowserRouter>
      <DirectMessagePage />
    </BrowserRouter>
  )
  const burger = await screen.findByLabelText("menu")
  await userEvent.click(burger)
  const user = await screen.findByText("abbey")
  expect(user).toBeDefined()
  const textBox = await screen.findByLabelText("Message box")
  await userEvent.type(textBox, "half of what I say is meaningless")
  const sendMessage = await screen.findByLabelText("Send message")
  await userEvent.click(sendMessage)
  // const message = await screen.findByText("julia")
  // expect(message).toBeDefined()
})

test("User can't send empty messages.", async () => {
  server.use(
    http.get(import.meta.env.VITE_API_URL! + 'timeline/', async () => {
      return HttpResponse.json([])
    }),
    http.get(import.meta.env.VITE_API_URL! + 'direct-message/', async () => {
      return HttpResponse.json([{
        id: "fake-id-lol",
        sender: "mock-sender",
        receiver: {
          id: "mock-receiver",
          tag: "1234",
          username: "abbey"
        }
      }])
    }),
    http.get(import.meta.env.VITE_API_URL! + "direct-message/:id", async () => {
      return HttpResponse.json([])
    }),
    http.post(import.meta.env.VITE_API_URL! + "direct-message/:id", async () => {
      throw new Error("message wasn't supposed to send")
    })
  )
  render(
    <BrowserRouter>
      <DirectMessagePage />
    </BrowserRouter>
  )
  const burger = await screen.findByLabelText("menu")
  await userEvent.click(burger)
  const user = await screen.findByText("abbey")
  expect(user).toBeDefined()
  const textBox = await screen.findByLabelText("Message box")
  await userEvent.type(textBox, " ")
  const sendMessage = await screen.findByLabelText("Send message")
  await userEvent.click(sendMessage)
})
