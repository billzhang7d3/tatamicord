import { Button, Menu, Text } from "@mantine/core"
import { IconDotsVertical, IconLogout, IconUserPlus, IconUsers, IconArrowRightDashed } from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"

interface Props {
  openFriendModal: () => void
  openTimelineModal: () => void
}

function ToolbarMobile({ openFriendModal, openTimelineModal }: Props) {
  const navigate = useNavigate()
  return (
    <Menu>
      <Menu.Target>
        <Button aria-label="more options" variant="transparent" size="xs">
          <IconDotsVertical />
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<IconUsers />} onClick={() => {
          navigate("/friends")
        }}>
          <Text>
            Friends
          </Text>
        </Menu.Item>
        <Menu.Item leftSection={<IconUserPlus />} onClick={openFriendModal}>
          <Text>
            Add Friend
          </Text>
        </Menu.Item>
        <Menu.Item leftSection={<IconLogout />} onClick={() => {
          localStorage.removeItem("authToken")
          navigate("/login")
        }}>
          <Text c="red">
            Log Out
          </Text>
        </Menu.Item>
        <Menu.Item leftSection={<IconArrowRightDashed />} onClick={openTimelineModal}>
          <Text>
            Create Timeline
          </Text>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}

export default ToolbarMobile