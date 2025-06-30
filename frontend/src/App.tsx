import "@mantine/core/styles.css"
import { MantineProvider } from "@mantine/core"
import { theme } from "./theme"
import LandingPage from "./components/Landing"
import {BrowserRouter, Route, Routes} from "react-router-dom"
import LoginPage from "./components/Login"
import RegisterPage from "./components/Register"

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  )
}
