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
import LogoButton from "./LogoButton";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const navigate = useNavigate();
  const [opened, {toggle}] = useDisclosure();
  const [username, setUsername] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password1, setPassword1] = useState<string>("")
  const [password2, setPassword2] = useState<string>("")
  const [validEmail, setValidEmail] = useState(true)
  const [validUser, setValidUser] = useState(true)
  const [registered, setRegistered] = useState(false)
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
      <AppShell.Main>
        <Stack align="stretch" style={{maxWidth: '300px'}}>
          <Center>
            <Title order={1}>Create Account</Title>
          </Center>
          <TextInput
            label="Username"
            placeholder="Username"
            onChange={(event) => setUsername(event.currentTarget.value)}
            error={!validUser && "Username already taken"}
          />
          <TextInput
            label="Email"
            placeholder="Email"
            onChange={(event) => setEmail(event.currentTarget.value)}
            error={!validEmail && "Email address already in use"}
          />
          <PasswordInput
            label="Password"
            placeholder="Password"
            onChange={(event) => setPassword1(event.currentTarget.value)}
          />
          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm Password"
            onChange={(event) => setPassword2(event.currentTarget.value)}
            error={password1 !== password2 && "passwords don't match"}
          />
          <Center>
            <Button
              variant="light"
              disabled={
                password1 !== password2 ||
                password1.length === 0 ||
                username.length === 0 ||
                email.length === 0
              }
              onClick={() => {
                fetch(import.meta.env.VITE_API_URL!.concat("register/"), {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    username,
                    email,
                    "password": password1
                  })
                })
                  .then((response) => {
                    if (response.ok) {
                      setRegistered(true)
                    }
                    return response.status
                  })
                  .then((statusCode) => {
                    if (statusCode === 409) {
                      // username already taken
                      setValidUser(false)
                      setValidEmail(true)
                    } else if (statusCode === 403) {
                      // email already in use
                      setValidEmail(false)
                      setValidUser(true)
                    }
                  })
              }}
            >
              Register
            </Button>
          </Center>
          {registered && <Center>
            <Text c="green">
              Account Creation Successful!
            </Text>
          </Center>}
          <Flex direction="row">
            <Group gap="xs">
              <Text size="sm">
                Already have an account?
              </Text>
              <UnstyledButton onClick={() => {
                navigate("/login")
              }}>
                <Text size="sm" td="underline" c="blue">
                  Sign In
                </Text>
              </UnstyledButton>
            </Group>
          </Flex>
        </Stack>
      </AppShell.Main>
    </AppShell>
  )
}

export default RegisterPage