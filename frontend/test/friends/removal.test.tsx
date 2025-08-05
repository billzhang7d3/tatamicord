import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest"
import { render, screen, userEvent } from ".."
import { BrowserRouter } from "react-router-dom"
import FriendsPage from "../../src/routes/Friends"

const server = setupServer()

describe("Friend Request Button Tests", () => {
  beforeAll(() => {
    server.listen()
  }) 
  afterAll(() => {
    server.close()
  })
  beforeEach(() => {
    server.resetHandlers()
  })

  test("Accept a friend request", async () => {
    let resultId = "";
    server.use(
      http.get(import.meta.env.VITE_API_URL! + 'direct-message/', async () => {
        return HttpResponse.json({ result: "fake-id-lol" })
      }),
      http.get(import.meta.env.VITE_API_URL! + 'friend/', async () => {
        return HttpResponse.json([])
      }),
      http.get(import.meta.env.VITE_API_URL! + 'outgoing-friend-requests/', async () => {
        return HttpResponse.json([])
      }),
      http.get(import.meta.env.VITE_API_URL! + 'incoming-friend-requests/', async () => {
        return HttpResponse.json([{
          id: "fake-id-two",
          username: "thousand years rain",
          tag: "1000"
        }])
      }),
      http.put(import.meta.env.VITE_API_URL! + 'friend-request/:id/', async ({ params }) => {
        resultId = params.id as string
        return HttpResponse.json([{ result: "friend request accepted" }])
      }),
    )
    render(
      <BrowserRouter>
        <FriendsPage />
      </BrowserRouter>
    )
    const friendRequestsButton = await screen.findByText("Friend Requests")
    await userEvent.click(friendRequestsButton)
    const acceptButton = await screen.findByLabelText("accept friend request from thousand years rain")
    await userEvent.click(acceptButton)
    expect(resultId).toBe("fake-id-two")
  })

  test("Reject a friend request", async () => {
    let resultId = ""
    server.use(
      http.get(import.meta.env.VITE_API_URL! + 'friend/', async () => {
        return HttpResponse.json([])
      }),
      http.get(import.meta.env.VITE_API_URL! + 'outgoing-friend-requests/', async () => {
        return HttpResponse.json([])
      }),
      http.get(import.meta.env.VITE_API_URL! + 'incoming-friend-requests/', async () => {
        return HttpResponse.json([{
          id: "fake-id-two",
          username: "thousand years rain",
          tag: "1000"
        }])
      }),
      http.delete(import.meta.env.VITE_API_URL! + 'friend-request/:id/', async ({ params }) => {
        resultId = params.id as string
        return HttpResponse.json([{ result: "friend request rejected" }])
      }),
    )
    render(
      <BrowserRouter>
        <FriendsPage />
      </BrowserRouter>
    )
    const friendRequestsButton = await screen.findByText("Friend Requests")
    await userEvent.click(friendRequestsButton)
    const rejectButton = await screen.findByLabelText("reject friend request from thousand years rain")
    await userEvent.click(rejectButton)
    expect(resultId).toBe("fake-id-two")
  })

  test("Revoke an outgoing friend request", async () => {
    let resultId = ""
    server.use(
      http.get(import.meta.env.VITE_API_URL! + 'friend/', async () => {
        return HttpResponse.json([])
      }),
      http.get(import.meta.env.VITE_API_URL! + 'outgoing-friend-requests/', async () => {
        return HttpResponse.json([{
          id: "fake-id-one",
          username: "flash back",
          tag: "2017"
        }])
      }),
      http.get(import.meta.env.VITE_API_URL! + 'incoming-friend-requests/', async () => {
        return HttpResponse.json([])
      }),
      http.delete(import.meta.env.VITE_API_URL! + 'friend-request/:id/', async ({ params }) => {
        resultId = params.id as string
        return HttpResponse.json([{ result: "friend request accepted" }])
      }),
    )
    render(
      <BrowserRouter>
        <FriendsPage />
      </BrowserRouter>
    )
    const friendRequestsButton = await screen.findByText("Friend Requests")
    await userEvent.click(friendRequestsButton)
    const revokeButton = await screen.findByLabelText("revoke friend request to flash back")
    await userEvent.click(revokeButton)
    expect(resultId).toBe("fake-id-one")
  })

  test("Revoke friendship", async () => {
    let resultId = ""
    server.use(
      http.get(import.meta.env.VITE_API_URL! + 'friend/', async () => {
        return HttpResponse.json([{
          id: "fake-id-zero",
          username: "sake",
          tag: "2025"
        }])
      }),
      http.get(import.meta.env.VITE_API_URL! + 'outgoing-friend-requests/', async () => {
        return HttpResponse.json([])
      }),
      http.get(import.meta.env.VITE_API_URL! + 'incoming-friend-requests/', async () => {
        return HttpResponse.json([])
      }),
      http.delete(import.meta.env.VITE_API_URL! + 'friend/:id/', async ({ params }) => {
        resultId = params.id as string
        return HttpResponse.json([{ result: "friendship removed" }])
      }),
    )
    render(
      <BrowserRouter>
        <FriendsPage />
      </BrowserRouter>
    )
    const friendRequestsButton = await screen.findByText("Friend Requests")
    await userEvent.click(friendRequestsButton)
    const moreSettings = await screen.findByLabelText("more settings with friend sake")
    await userEvent.click(moreSettings)
    const deleteButton = await screen.findByText("Remove Friend")
    await userEvent.click(deleteButton)
    expect(resultId).toBe("fake-id-zero")
  })
})
