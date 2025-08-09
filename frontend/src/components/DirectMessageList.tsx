import { Avatar, NavLink, Stack } from "@mantine/core"
import { DirectMessageInfo } from "../types"
import { useNavigate } from "react-router-dom"

interface Props {
  dmList: DirectMessageInfo[]
  toggle: () => void
}

function DirectMessageList({ dmList, toggle }: Props) {
  const navigate = useNavigate()
  return (
    <Stack justify="flex-start" align="flex-start" gap="xs">
      {dmList.map(dm =>
        <NavLink
          label={dm.receiver.username}
          key={dm.id}
          leftSection={<Avatar radius="xl" />}
          onClick={() => {
            toggle()
            navigate(`/direct-message/${dm.receiver.id}`)
          }}
        />
      )}
    </Stack>
  )
}

export default DirectMessageList
