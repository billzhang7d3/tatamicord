import { Avatar, NavLink, Stack } from "@mantine/core"
import { DirectMessageInfo } from "../types"
import { useNavigate } from "react-router-dom"

interface Props {
  dmList: DirectMessageInfo[]
}

function DirectMessageList({ dmList }: Props) {
  const navigate = useNavigate()
  return (
    <Stack justify="flex-start" align="flex-start">
      {dmList.map(dm =>
        <NavLink
          label={dm.receiver.username}
          key={dm.id}
          leftSection={<Avatar radius="xl" />}
          onClick={() => {
            navigate(`/direct-message/${dm.receiver.id}`)
          }}
        />
      )}
    </Stack>
  )
}

export default DirectMessageList
