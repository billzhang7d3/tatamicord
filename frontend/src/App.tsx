import "@mantine/core/styles.css"
import { MantineProvider } from "@mantine/core"
import { theme } from "./theme"
import LandingPage from "./routes/Landing"
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom"
import LoginPage from "./routes/Login"
import RegisterPage from "./routes/Register"
import HomePage from "./routes/Home"
import FriendsPage from "./routes/Friends"
import DirectMessagePage from "./routes/DirectMessage"
import TimelinePage from "./routes/Timeline"

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
          <Route path="friends" element={isAuthenticated ? <FriendsPage /> : <Navigate to="../login" />} />
          <Route path="direct-message/:id" element={isAuthenticated ? <DirectMessagePage /> : <Navigate to="../login" />} />
          <Route path="timeline/:timelineId/:channelId" element={isAuthenticated ? <TimelinePage /> : <Navigate to="../login" />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  )
}
