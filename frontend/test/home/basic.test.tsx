import { BrowserRouter } from "react-router-dom";
import { render, screen } from ".."
import HomePage from "../../src/components/Home";
import { test, expect, beforeAll } from "vitest";
import { setupServer } from "msw/node"
import { http, HttpResponse } from "msw"

const server = setupServer()

beforeAll(() => {
  server.listen()
}) 

test("Homepage renders.", () => {
  server.use(
    http.get(import.meta.env.VITE_API_URL! + 'timeline/', async () => {
      return HttpResponse.json({
        "result": []
      })
    }),
    http.get(import.meta.env.VITE_API_URL! + 'friend/', async () => {
      return HttpResponse.json({
        "result": []
      })
    }),
    http.get(import.meta.env.VITE_API_URL! + 'outgoing-friend-requests/', async () => {
      return HttpResponse.json({
        "result": []
      })
    }),
    http.get(import.meta.env.VITE_API_URL! + 'incoming-friend-requests/', async () => {
      return HttpResponse.json({
        "result": []
      })
    }),
  )
  render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  )
  const text = screen.getByText("Home")
  expect(text).toBeDefined()
})

test("Fetch fail case.", () => {
  server.use(
    http.get(import.meta.env.VITE_API_URL! + 'timeline/', async () => {
      return new HttpResponse(null, {status: 404})
    }),
    http.get(import.meta.env.VITE_API_URL! + 'friend/', async () => {
      return HttpResponse.json({
        "result": []
      })
    }),
    http.get(import.meta.env.VITE_API_URL! + 'outgoing-friend-requests/', async () => {
      return HttpResponse.json({
        "result": []
      })
    }),
    http.get(import.meta.env.VITE_API_URL! + 'incoming-friend-requests/', async () => {
      return HttpResponse.json({
        "result": []
      })
    }),
  )
  render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  )
})
