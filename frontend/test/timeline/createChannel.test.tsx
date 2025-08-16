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
    useNavigate: () => buttonSpy,
    useParams: () => {
      return { timelineId: "fake-timeline", channelId: "fake-channel" }
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

test("Can create channel.", async () => {
  let called = false
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
    http.post(import.meta.env.VITE_API_URL! + "channel/:timelineId/", async () => {
      called = true
      return HttpResponse.json([{
        id: "fake-channel-2",
        name: "bjork",
        timeline: "fake-timeline"
      }])
    }),
    http.get(import.meta.env.VITE_API_URL! + "messages/:channelId/", async () => {
      return HttpResponse.json([])
    })
  )
  render(
    <BrowserRouter>
      <TimelinePage />
    </BrowserRouter>
  )
  const burger = await screen.findByLabelText("menu")
  await userEvent.click(burger)
  const createChannel = await screen.findByText("Create Channel")
  await userEvent.click(createChannel)
  const textBox = await screen.findByPlaceholderText("Channel Name")
  await userEvent.type(textBox, "bjork")
  const submit = await screen.findByLabelText("create channel")
  await userEvent.click(submit)
  expect(called).toBeTruthy()
})

// channel name can't be empty
test("Channel name can't be empty.", async () => {
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
    http.post(import.meta.env.VITE_API_URL! + "channel/:timelineId/", async () => {
      return HttpResponse.json([{
        id: "fake-channel-2",
        name: "bjork",
        timeline: "fake-timeline"
      }])
    }),
    http.get(import.meta.env.VITE_API_URL! + "messages/:channelId/", async () => {
      return HttpResponse.json([])
    })
  )
  render(
    <BrowserRouter>
      <TimelinePage />
    </BrowserRouter>
  )
  const burger = await screen.findByLabelText("menu")
  await userEvent.click(burger)
  const createChannel = await screen.findByText("Create Channel")
  await userEvent.click(createChannel)
  const createChannel2 = await screen.findByLabelText("create channel")
  await userEvent.click(createChannel2)
  const invalidText = await screen.findByText("Invalid Channel Name")
  expect(invalidText).toBeDefined()
})
