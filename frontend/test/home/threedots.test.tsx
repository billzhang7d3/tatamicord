import { BrowserRouter } from "react-router-dom";
import { render, screen, userEvent } from ".."
import { beforeAll, afterAll, beforeEach, test, expect, describe, vi } from "vitest"
import { setupServer } from "msw/node"
import { http, HttpResponse } from "msw"
import HomePage from "../../src/components/Home"

const server = setupServer()

const buttonSpy = vi.fn()

describe("Friends Page Test", () => {
  vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom")
    return {
      ...actual,
      useNavigate: () => buttonSpy,
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

  test("Clicking three dots shows option to see friends list.", async () => {
    server.use(
      http.get(import.meta.env.VITE_API_URL! + 'timeline/', async () => {
        return HttpResponse.json([])
      })
    )
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )
    const threedots = await screen.findByLabelText("more options")
    await userEvent.click(threedots)
    const friends = await screen.findByText("Friends")
    expect(friends).toBeDefined()
  })

  test("Clicking friends page navigates to friends.", async () => {
    server.use(
      http.get(import.meta.env.VITE_API_URL! + 'timeline/', async () => {
        return HttpResponse.json([])
      }),
      // http.get(import.meta.env.VITE_API_URL! + 'friend/', async () => {
      //   return HttpResponse.json({
      //     "result": []
      //   })
      // }),
      // http.get(import.meta.env.VITE_API_URL! + 'outgoing-friend-requests/', async () => {
      //   return HttpResponse.json({
      //     "result": []
      //   })
      // }),
      // http.get(import.meta.env.VITE_API_URL! + 'incoming-friend-requests/', async () => {
      //   return HttpResponse.json({
      //     "result": []
      //   })
      // }),
    )
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )
    const threedots = await screen.findByLabelText("more options")
    await userEvent.click(threedots)
    const friends = await screen.findByText("Friends")
    await userEvent.click(friends)
    expect(buttonSpy).toHaveBeenCalledWith("/friends")
  })

})
