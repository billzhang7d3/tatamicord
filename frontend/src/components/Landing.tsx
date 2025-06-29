import {
  AppShell,
  Burger,
  Button,
  Group,
  Stack,
  Text
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

function LandingPage() {
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
          <Text
            size="lg"
            fw={900}
            variant="gradient"
            gradient={{ from: 'yellow.3', to: 'teal.8', deg: 135 }}
          >
            Tatamicord
          </Text>
        </Group>
      </AppShell.Header>
      {/* <AppShell.Navbar p="md">
        Navbar
      </AppShell.Navbar> */}
      <AppShell.Main>
        <Stack align="center">
          <Button variant="light">Login</Button>
          <Button variant="light">Register</Button>
        </Stack>
      </AppShell.Main>
    </AppShell>
  )
}

export default LandingPage;