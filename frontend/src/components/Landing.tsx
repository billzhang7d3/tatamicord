import {
  AppShell,
  Burger,
  Button,
  Group,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import LogoButton from "./LogoButton";

function LandingPage() {
  const navigate = useNavigate();
  const [opened, {toggle}] = useDisclosure();
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <LogoButton />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        Navbar
      </AppShell.Navbar>
      <AppShell.Main>
        <Stack align="center">
          <Button
            variant="light"
            onClick={() => {
              navigate("/login")
            }}   
          >
            Login
          </Button>
          <Button
            variant="light"
            onClick={() => {
              navigate("/register")
            }}
          >
            Register
          </Button>
        </Stack>
      </AppShell.Main>
    </AppShell>
  )
}

export default LandingPage;