import {
  AppShell,
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
import { useNavigate } from "react-router-dom"
import LogoButton from "../components/LogoButton"
import { useForm } from "@mantine/form"

// TODO: make login button show further down

function LoginPage() {
  const loginForm = useForm({
    mode: "uncontrolled",
    initialValues: { email: "", password: "" }
  })
  const navigate = useNavigate()
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { desktop: true, mobile: true } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <LogoButton />
        </Group>
      </AppShell.Header>
        <AppShell.Main>
          <Center>
          <Stack align="stretch" style={{maxWidth: "300px"}}>
            <Center>
              <Title order={1}>Login</Title>
            </Center>
            <form onSubmit={loginForm.onSubmit((credentials) => {
              fetch(import.meta.env.VITE_API_URL!.concat("login/"), {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(credentials)
              })
                .then((response) => {
                  if (!response.ok) {
                    throw new Error("Invalid Credentials");
                  }
                  return response.json()
                })
                .then((result) => {
                  localStorage.setItem("authToken", result.result)
                  navigate("/home")
                })
                .catch(() => {
                  loginForm.setErrors({
                    email: true,
                    password: "Invalid Credentials!"
                  })
                })
            })}>
              <Stack>
                <TextInput
                  label="Email"
                  placeholder="Email"
                  key={loginForm.key("email")}
                  {...loginForm.getInputProps("email")}
                />
                <PasswordInput
                  label="Password"
                  placeholder="Password"
                  key={loginForm.key("password")}
                  {...loginForm.getInputProps("password")}
                />
                <Center>
                  <Button type="submit" variant="light" onClick={() => {
                    navigate("/home")
                  }}>
                    Sign In
                  </Button>
                </Center>
              </Stack>
            </form>
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
        </Center>
      </AppShell.Main>
    </AppShell>
  )
}

export default LoginPage;