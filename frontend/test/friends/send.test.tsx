import { BrowserRouter } from "react-router-dom";
import { render, screen, userEvent } from ".."
import { beforeAll, afterAll, beforeEach, test, expect, describe, vi } from "vitest"
import { setupServer } from "msw/node"
import { http, HttpResponse } from "msw"
import HomePage from "../../src/components/Home";

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

test("Send a valid friend request.", async () => {
  server.use(
    http.get(import.meta.env.VITE_API_URL! + 'timeline/', async () => {
      return HttpResponse.json([])
    }),
    http.post(import.meta.env.VITE_API_URL! + 'friend-request/', async () => {
      return HttpResponse.json({
        result: "friend request sent"
      })
    })
  )
  render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  )
  // navigate to modal
  const threedots = await screen.findByLabelText("more options")
  await userEvent.click(threedots)
  const friendsButton = await screen.findByText("Add Friend")
  await userEvent.click(friendsButton)
  // main stuff
  const username = await screen.findByPlaceholderText("Username")
  await userEvent.type(username, "ocean")
  const tag = await screen.findByPlaceholderText("#")
  await userEvent.type(tag, "2011")
  const sendButton = await screen.findByText("Send Friend Request")
  await userEvent.click(sendButton)
  const successMessage = await screen.findByText("Friend request sent!")
  expect(successMessage).toBeDefined()
})

test("Send a friend request to someone already friends.", async () => {
  server.use(
    http.get(import.meta.env.VITE_API_URL! + 'timeline/', async () => {
      return HttpResponse.json([])
    }),
    http.post(import.meta.env.VITE_API_URL! + 'friend-request/', async () => {
      return new HttpResponse(null, {status: 403})
    })
  )
  render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  )
  // navigate to modal
  const threedots = await screen.findByLabelText("more options")
  await userEvent.click(threedots)
  const friendsButton = await screen.findByText("Add Friend")
  await userEvent.click(friendsButton)
  // main stuff
  const username = await screen.findByPlaceholderText("Username")
  await userEvent.type(username, "ocean")
  const tag = await screen.findByPlaceholderText("#")
  await userEvent.type(tag, "2011")
  const sendButton = await screen.findByText("Send Friend Request")
  await userEvent.click(sendButton)
  const errorMessage = await screen.findByText("You're already friends with that user!")
  expect(errorMessage).toBeDefined()
})

test("Send a friend request when it already exists.", async () => {
  server.use(
    http.get(import.meta.env.VITE_API_URL! + 'timeline/', async () => {
      return HttpResponse.json([])
    }),
    http.post(import.meta.env.VITE_API_URL! + 'friend-request/', async () => {
      return new HttpResponse(null, {status: 409})
    })
  )
  render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  )
  // navigate to modal
  const threedots = await screen.findByLabelText("more options")
  await userEvent.click(threedots)
  const friendsButton = await screen.findByText("Add Friend")
  await userEvent.click(friendsButton)
  // main stuff
  const username = await screen.findByPlaceholderText("Username")
  await userEvent.type(username, "ocean")
  const tag = await screen.findByPlaceholderText("#")
  await userEvent.type(tag, "2011")
  const sendButton = await screen.findByText("Send Friend Request")
  await userEvent.click(sendButton)
  const errorMessage = await screen.findByText("You've already sent that user a friend request!")
  expect(errorMessage).toBeDefined()
})

test("Send a friend request to nonexistent friend.", async () => {
  server.use(
    http.get(import.meta.env.VITE_API_URL! + 'timeline/', async () => {
      return HttpResponse.json([])
    }),
    http.post(import.meta.env.VITE_API_URL! + 'friend-request/', async () => {
      return new HttpResponse(null, {status: 404})
    })
  )
  render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  )
  // navigate to modal
  const threedots = await screen.findByLabelText("more options")
  await userEvent.click(threedots)
  const friendsButton = await screen.findByText("Add Friend")
  await userEvent.click(friendsButton)
  // main stuff
  const username = await screen.findByPlaceholderText("Username")
  await userEvent.type(username, "ocean")
  const tag = await screen.findByPlaceholderText("#")
  await userEvent.type(tag, "2011")
  const sendButton = await screen.findByText("Send Friend Request")
  await userEvent.click(sendButton)
  const errorMessage = await screen.findByText("User not found.")
  expect(errorMessage).toBeDefined()
})

test("Enter in value not for submission", async () => {
  server.use(
    http.get(import.meta.env.VITE_API_URL! + 'timeline/', async () => {
      return HttpResponse.json([])
    }),
  )
  render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  )
  // navigate to modal
  const threedots = await screen.findByLabelText("more options")
  await userEvent.click(threedots)
  const friendsButton = await screen.findByText("Add Friend")
  await userEvent.click(friendsButton)
  // main stuff
  const username = await screen.findByPlaceholderText("Username")
  await userEvent.type(username, "oceanoceanoceanoceanoceanoceanoceanoceanoceanoceanoceanocean")
  const tag = await screen.findByPlaceholderText("#")
  await userEvent.type(tag, "11111")
  const sendButton = await screen.findByText("Send Friend Request")
  await userEvent.click(sendButton)
  const errorMessage = await screen.findByText("Username must be between 1 and 32 characters")
  expect(errorMessage).toBeDefined()
})
