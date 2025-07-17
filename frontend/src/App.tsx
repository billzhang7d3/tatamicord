import "@mantine/core/styles.css"
import { MantineProvider } from "@mantine/core"
import { theme } from "./theme"
import LandingPage from "./components/Landing"
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom"
import LoginPage from "./components/Login"
import RegisterPage from "./components/Register"
import HomePage from "./components/Home"

export default function App() {
  const isAuthenticated = localStorage.getItem("authToken") !== null;
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="home" element={isAuthenticated ? <HomePage /> : <Navigate to="../login" />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  )
}
