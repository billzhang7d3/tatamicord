import { Text, UnstyledButton } from "@mantine/core"
import { useNavigate } from "react-router-dom"

function LogoButton() {
  const navigate = useNavigate()
  return (
    <UnstyledButton onClick={() => {
      navigate("/")
    }}>
      <Text
        size="lg"
        fw={900}
        variant="gradient"
        gradient={{ from: 'yellow.3', to: 'teal.8', deg: 135 }}
      >
        Tatamicord
      </Text>
    </UnstyledButton>
  )
}

export default LogoButton