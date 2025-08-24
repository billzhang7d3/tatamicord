import { Button, Divider, Menu, Text } from "@mantine/core"
import {
  IconArrowRightDashed,
  IconDotsVertical,
  IconLogout,
  IconTrendingUp2,
  IconUserPlus,
  IconUsers,
  IconUsersPlus
} from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"

interface Props {
  openFriendModal: () => void
  openCreateTimelineModal: () => void
  openJoinTimelineModal: () => void
  openCreateInviteModal?: () => void
  timelineId?: string
}

function ToolbarSm({
  openFriendModal,
  openCreateTimelineModal,
  openJoinTimelineModal,
  openCreateInviteModal,
  timelineId
}: Props) {
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
        <Menu.Item leftSection={<IconArrowRightDashed />} onClick={openCreateTimelineModal}>
          <Text>
            Create Timeline
          </Text>
        </Menu.Item>
        <Menu.Item leftSection={<IconTrendingUp2 />} onClick={openJoinTimelineModal}>
          <Text>
            Join Timeline
          </Text>
        </Menu.Item>
        {timelineId && (
          <>
            <Divider />
            <Menu.Item leftSection={<IconUsersPlus />} onClick={openCreateInviteModal}>
              <Text>
                Create Invite
              </Text>
            </Menu.Item>
          </>
        )}
        <Divider />
        <Menu.Item leftSection={<IconLogout color="var(--mantine-color-red-filled)" />} onClick={() => {
          localStorage.removeItem("authToken")
          navigate("/login")
        }}>
          <Text c="var(--mantine-color-red-filled)">
            Log Out
          </Text>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}

export default ToolbarSm