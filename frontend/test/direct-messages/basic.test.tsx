import { BrowserRouter } from "react-router-dom";
import { render, screen, userEvent } from ".."
import HomePage from "../../src/routes/Home";
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

test("User can see dm messages at start.", async () => {
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
          username: "abbey"
        }
      }])
    }),
    http.get(import.meta.env.VITE_API_URL! + 'direct-message/:id', async () => {
      return HttpResponse.json([{
        id: "fake-id0-lol",
        location: "location-id-doesnt-matter-lol",
        sender: {
          id: "fake-id2-lol",
          tag: "1234",
          username: "abbey"
        },
        content: "revolver",
        time_sent: "2023-07-15T06:06:19.892Z",
        edited: false
      }, {
        id: "fake-id-lol",
        location: "location-id-doesnt-matter-lol",
        sender: {
          id: "fake-id3-lol",
          tag: "1234",
          username: "pepper"
        },
        content: "while my guitar",
        time_sent: "2022-08-01T06:06:19.892Z",
        edited: true
      }])
    }),
  )
  render(
    <BrowserRouter>
      <DirectMessagePage />
    </BrowserRouter>
  )
  const message1 = await screen.findByText("while my guitar")
  expect(message1).toBeDefined()
  const message2 = await screen.findByText("revolver")
  expect(message2).toBeDefined()
})

test("User can see friends page.", async () => {
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
          username: "abbey"
        }
      }])
    }),
    http.get(import.meta.env.VITE_API_URL! + 'direct-message/:id', async () => {
      return HttpResponse.json([{
        id: "fake-id0-lol",
        location: "location-id-doesnt-matter-lol",
        sender: {
          id: "fake-id2-lol",
          tag: "1234",
          username: "abbey"
        },
        content: "revolver",
        time_sent: "2023-07-15T06:06:19.892Z",
        edited: false
      }, {
        id: "fake-id-lol",
        location: "location-id-doesnt-matter-lol",
        sender: {
          id: "fake-id3-lol",
          tag: "1234",
          username: "pepper"
        },
        content: "while my guitar",
        time_sent: "2022-08-01T06:06:19.892Z",
        edited: true
      }])
    }),
  )
  render(
    <BrowserRouter>
      <DirectMessagePage />
    </BrowserRouter>
  )
  const burger = await screen.findByLabelText("menu")
  await userEvent.click(burger)
  const user = await screen.findByText("pepper")
  expect(user).toBeDefined()
})
