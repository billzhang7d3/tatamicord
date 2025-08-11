import { BrowserRouter } from "react-router-dom";
import { render, screen, userEvent } from ".."
import { beforeAll, afterAll, beforeEach, test, expect, describe, vi } from "vitest"
import { setupServer } from "msw/node"
import { http, HttpResponse } from "msw"
import HomePage from "../../src/routes/Home"

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
      }),
      http.get(import.meta.env.VITE_API_URL! + 'direct-message/', async () => {
        return HttpResponse.json([])
      }),
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
      http.get(import.meta.env.VITE_API_URL! + 'direct-message/', async () => {
        return HttpResponse.json([])
      }),
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

  test("Clicking logout navigates to login page.", async () => {
    server.use(
      http.get(import.meta.env.VITE_API_URL! + 'timeline/', async () => {
        return HttpResponse.json([])
      }),
      http.get(import.meta.env.VITE_API_URL! + 'direct-message/', async () => {
        return HttpResponse.json([])
      }),
    )
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )
    const threedots = await screen.findByLabelText("more options")
    await userEvent.click(threedots)
    const logout = await screen.findByText("Log Out")
    await userEvent.click(logout)
    expect(buttonSpy).toHaveBeenCalledWith("/login")
  })

})

describe("Timeline Creation Tests", () => {
  beforeAll(() => {
    server.listen()
  }) 

  afterAll(() => {
    server.close()
  })

  beforeEach(() => {
    server.resetHandlers()
  })

  test("Clicking Create Timeline will show the modal.", async () => {
    server.use(
      http.get(import.meta.env.VITE_API_URL! + 'timeline/', async () => {
        return HttpResponse.json([])
      }),
      http.get(import.meta.env.VITE_API_URL! + 'direct-message/', async () => {
        return HttpResponse.json([])
      }),
    )
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )
    const threedots = await screen.findByLabelText("more options")
    await userEvent.click(threedots)
    const button = await screen.findByText("Create Timeline")
    await userEvent.click(button)
    const label = await screen.findByPlaceholderText("Timeline Name")
    expect(label).toBeDefined()
  })

  test("Timeline creation works.", async () => {
    let defined = false
    server.use(
      http.get(import.meta.env.VITE_API_URL! + "timeline/", async () => {
        return HttpResponse.json([])
      }),
      http.get(import.meta.env.VITE_API_URL! + "direct-message/", async () => {
        return HttpResponse.json([])
      }),
      http.post(import.meta.env.VITE_API_URL! + "timeline/", async () => {
        defined = true
        return HttpResponse.json({})
      })
    )
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )
    const threedots = await screen.findByLabelText("more options")
    await userEvent.click(threedots)
    const button = await screen.findByText("Create Timeline")
    await userEvent.click(button)
    const label = await screen.findByPlaceholderText("Timeline Name")
    await userEvent.type(label, "galaxy")
    const submit = await screen.findByText("Create My Timeline!")
    await userEvent.click(submit)
    expect(defined).toBeTruthy()
  })

  test("Can't submit an empty timeline.", async () => {
    let defined = false
    server.use(
      http.get(import.meta.env.VITE_API_URL! + "timeline/", async () => {
        return HttpResponse.json([])
      }),
      http.get(import.meta.env.VITE_API_URL! + "direct-message/", async () => {
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
    const button = await screen.findByText("Create Timeline")
    await userEvent.click(button)
    const submit = await screen.findByText("Create My Timeline!")
    await userEvent.click(submit)
    const warningText = await screen.findByText("Timeline name can't be empty")
    expect(warningText).toBeDefined()
  })

})
