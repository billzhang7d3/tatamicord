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

test("Timeline page can navigate home.", async () => {
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
      return HttpResponse.json([])
    })
  )
  render(
    <BrowserRouter>
      <TimelinePage />
    </BrowserRouter>
  )
  const timelineBar = await screen.findByText("mantine")
  await userEvent.click(timelineBar)
  const home = await screen.findByText("Home")
  await userEvent.click(home)
  expect(buttonSpy).toHaveBeenCalledWith("/home")
})

test("Timeline page can navigate to other timelines.", async () => {
  server.use(
    http.get(import.meta.env.VITE_API_URL! + "timeline/", async () => {
      return HttpResponse.json([{
        id: "fake-timeline",
        name: "mantine",
        owner: "me",
        default_channel: "fake-channel"
      }, {
        id: "fake-timeline-2",
        name: "byzantine-fault",
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
      return HttpResponse.json([])
    })
  )
  render(
    <BrowserRouter>
      <TimelinePage />
    </BrowserRouter>
  )
  const timelineBar = await screen.findByText("mantine")
  await userEvent.click(timelineBar)
  const timeline = await screen.findByText("byzantine-fault")
  await userEvent.click(timeline)
  expect(buttonSpy).toHaveBeenCalledWith("/timeline/fake-timeline-2/fake-channel")
})
