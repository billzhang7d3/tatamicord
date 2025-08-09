import { BrowserRouter } from "react-router-dom";
import { render, screen, userEvent } from ".."
import TimelinePage from "../../src/routes/Timeline";
import { test, expect, beforeAll, beforeEach, afterAll, vi } from "vitest";
import { setupServer } from "msw/node"
import { http, HttpResponse } from "msw"

const server = setupServer()

const buttonSpy = vi.fn()

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useParams: () => {
      return { timelineId: "fake-timeline", channelId: "fake-channel" }
    },
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

test("User can navigate channels", async () => {
  server.use(
    http.get(import.meta.env.VITE_API_URL! + "timeline/", async () => {
      return HttpResponse.json([{
        id: "fake-timeline",
        name: "mantine",
        default_channel: "fake-channel"
      }])
    }),
    http.get(import.meta.env.VITE_API_URL! + "channel/:id/", async () => {
      return HttpResponse.json([{
        id: "fake-channel",
        name: "dev",
        timeline: "fake-timeline"
      }, {
        id: "fanart-id",
        name: "fanart",
        timeline: "fake-timeline"
      }])
    })
  )
  render(
    <BrowserRouter>
      <TimelinePage />
    </BrowserRouter>
  )
  const burger = await screen.findByLabelText("menu")
  await userEvent.click(burger)
  const fanart = await screen.findByText("#fanart")
  await userEvent.click(fanart)
  expect(buttonSpy).toHaveBeenCalledWith("/timeline/fake-timeline/fanart-id")
})
