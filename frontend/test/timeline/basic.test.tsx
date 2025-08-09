import { BrowserRouter } from "react-router-dom";
import { render, screen, userEvent } from ".."
import TimelinePage from "../../src/routes/Timeline";
import { test, expect, beforeAll, beforeEach, afterAll, vi } from "vitest";
import { setupServer } from "msw/node"
import { http, HttpResponse } from "msw"

const server = setupServer()

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
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

test("Timeline page shows channels in menu.", async () => {
  server.use(
    http.get(import.meta.env.VITE_API_URL! + "timeline/", async () => {
      console.log("vrvrjj")
      return HttpResponse.json([{
        id: "fake-timeline",
        name: "mantine",
        defaultChannel: "fake-channel"
      }])
    }),
    http.get(import.meta.env.VITE_API_URL! + "channel/:id/", async () => {
      console.log("vrvrjj")
      return HttpResponse.json([{
        id: "fake-channel",
        name: "dev",
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
  const dev = await screen.findByText("#dev")
  expect(dev).toBeDefined()
})
