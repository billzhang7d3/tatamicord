import { AppShell, Burger, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import LogoButton from "./LogoButton";
// import { useNavigate } from "react-router-dom";

function RegisterPage() {
  // const navigate = useNavigate();
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
    </AppShell>
  )
}

export default RegisterPage