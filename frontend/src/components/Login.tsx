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
import { useDisclosure } from "@mantine/hooks"
import { useNavigate } from "react-router-dom"
import LogoButton from "./LogoButton"
// import dotenv from "dotenv"
import { useState } from "react";

// dotenv.config()

function LoginPage() {
  const navigate = useNavigate()
  const [opened, {toggle}] = useDisclosure()
  const [email, setEmail] = useState<String>("")
  const [password, setPassword] = useState<String>("")
  const [invalid, setInvalid] = useState(false)
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
            <Title order={1}>Login</Title>
          </Center>
          <TextInput
            label="Email"
            placeholder="Email"
            onChange={(event) => setEmail(event.currentTarget.value)}
            error={invalid}
          />
          <PasswordInput
            label="Password"
            placeholder="Password"
            onChange={(event) => setPassword(event.currentTarget.value)}
            error={invalid}
          />
          <Center>
            <Button
              variant="light"
              onClick={() => {
                const API_URL = "http://localhost:8080"
                fetch(API_URL + "/login/", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    email: email,
                    password: password
                  })
                })
                  .then((response) => {
                    if (!response.ok) {
                      throw new Error('Invalid Credentials');
                    }
                    return response.json()
                  })
                  .then((result) => {
                    localStorage.setItem("authToken", result.result)
                    navigate("/home")
                  })
                  .catch(() => {
                    setInvalid(true)
                  })
              }}
            >
              Sign In
            </Button>
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