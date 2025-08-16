import { BrowserRouter } from "react-router-dom";
import { render, screen, userEvent } from ".."
import TimelinePage from "../../src/routes/Timeline"
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

test("Can send message in channel.", async () => {
  let sent = false
  server.use(
    http.get(import.meta.env.VITE_API_URL! + "timeline/", async () => {
      return HttpResponse.json([{
        id: "fake-timeline",
        name: "mantine",
        owner: "me",
        default_channel: "fake-channel"
      }])
    }),
    http.get(import.meta.env.VITE_API_URL! + "channel/:timelineId/", async () => {
      return HttpResponse.json([{
        id: "fake-channel",
        name: "dev",
        timeline: "fake-timeline"
      }])
    }),
    http.get(import.meta.env.VITE_API_URL! + "messages/:channelId/", async () => {
      return HttpResponse.json([{
        id: "fake-message-id",
        location: "fake-channel",
        sender: {
          id: "fake-user-id",
          username: "vincent",
          tag: "0909"
        },
        "content": "cogito, ergo sum",
        time_sent: (new Date()).toISOString(),
        edited: false
      }])
    }),
    http.post(import.meta.env.VITE_API_URL! + "message/:channelId/", async () => {
      sent = true
      return HttpResponse.json({})
    })
  )
  render(
    <BrowserRouter>
      <TimelinePage />
    </BrowserRouter>
  )
  const textBox = await screen.findByLabelText("Message box")
  await userEvent.type(textBox, "existence preceeds essence")
  const sendMessage = await screen.findByLabelText("Send message")
  await userEvent.click(sendMessage)
  expect(sent).toBeTruthy()
})
