import "@mantine/core/styles.css"
import { MantineProvider } from "@mantine/core"
import { theme } from "./theme"
import LandingPage from "./components/Landing"

export default function App() {
  return (
  <MantineProvider theme={theme}>
    <LandingPage />
  </MantineProvider>
  )
}
