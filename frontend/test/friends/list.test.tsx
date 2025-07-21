import { BrowserRouter } from "react-router-dom";
import { render, screen, userEvent } from ".."
import { beforeAll, afterAll, beforeEach, test, expect } from "vitest"
import { setupServer } from "msw/node"
import { http, HttpResponse } from "msw"
import FriendsPage from "../../src/components/Friends";

const server = setupServer()

beforeAll(() => {
  server.listen()
}) 

afterAll(() => {
  server.close()
})

beforeEach(() => {
  server.resetHandlers()
})

test("Friends list renders.", async () => {
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
  const friendRequests = await screen.findByText("Friend Requests")
  expect(friendRequests).toBeDefined()
})

test("Friends list shows current friends.", async () => {
  server.use(
    http.get(import.meta.env.VITE_API_URL! + 'friend/', async () => {
      return HttpResponse.json([{
        id: "fake-id-one",
        username: "flash back",
        tag: "2017"
      }])
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
  const username = await screen.findByText("flash back")
  expect(username).toBeDefined()
})

test("Other tab shows outgoing and incoming friend requests.", async () => {
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
      return HttpResponse.json([{
        id: "fake-id-two",
        username: "thousand years rain",
        tag: "1000"
      }])
    }),
  )
  render(
    <BrowserRouter>
      <FriendsPage />
    </BrowserRouter>
  )
  const friendRequestsButton = await screen.findByText("Friend Requests")
  await userEvent.click(friendRequestsButton)
  const username = await screen.findByText("flash back")
  expect(username).toBeDefined()
  const username2 = await screen.findByText("thousand years rain")
  expect(username2).toBeDefined()
})
