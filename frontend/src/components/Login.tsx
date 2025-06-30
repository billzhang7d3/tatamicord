import {
  AppShell,
  Burger,
  Button,
  Center,
  Flex,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
  UnstyledButton
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import LogoButton from "./LogoButton";


function LoginPage() {
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
      {/* <AppShell.Navbar p="md">
        Navbar
      </AppShell.Navbar> */}
      <AppShell.Main>
        <Stack align="stretch" style={{maxWidth: '300px'}}>
          <Center>
            <Title order={1}>Log In</Title>
          </Center>
          <TextInput
            label="Username"
            placeholder="Username"
          />
          <PasswordInput
            label="Password"
            placeholder="Password"
          />
          <Center>
            <Button variant="light">Login</Button>
          </Center>
          <Flex direction="row">
            <Group gap="xs">
              <Text size="sm">
                Don't have an account?
              </Text>
              <UnstyledButton onClick={() => {
                navigate("/register")
              }}>
                <Text size="sm" td="underline" c="blue">
                  Create an account
                </Text>
              </UnstyledButton>
            </Group>
          </Flex>
        </Stack>
      </AppShell.Main>
    </AppShell>
  )
}

export default LoginPage;