import { BrowserRouter } from "react-router-dom";
import { render, screen, userEvent } from ".."
import { beforeAll, afterAll, beforeEach, test, expect, describe, vi } from "vitest"
import { setupServer } from "msw/node"
import { http, HttpResponse } from "msw"
import FriendsPage from "../../src/components/Friends";

const server = setupServer()

const buttonSpy = vi.fn()

describe("Routing Tests", () => {
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

  test("User can go back to home.", async () => {
    server.use(
      http.get(import.meta.env.VITE_API_URL! + 'friend/', async () => {
        return HttpResponse.json([])
      }),
      http.get(import.meta.env.VITE_API_URL! + 'outgoing-friend-requests/', async () => {
        return HttpResponse.json([])
      }),
      http.get(import.meta.env.VITE_API_URL! + 'incoming-friend-requests/', async () => {
        return HttpResponse.json([])
      }),
    )
    render(
      <BrowserRouter>
        <FriendsPage />
      </BrowserRouter>
    )
    const goback = await screen.findByLabelText("Go back")
    await userEvent.click(goback)
    expect(buttonSpy).toHaveBeenCalledWith(-1)
  })

})
