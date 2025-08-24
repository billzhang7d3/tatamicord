import { Button, Divider, Group } from "@mantine/core"
import { IconArrowRightDashed, IconLogout, IconTrendingUp2, IconUserPlus, IconUsers } from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"

interface Props {
  openFriendModal: () => void
  openCreateTimelineModal: () => void
  openJoinTimelineModal: () => void
  openCreateInviteModal?: () => void
  timelineId?: string
}

function ToolbarLg({
  openFriendModal,
  openCreateTimelineModal,
  openJoinTimelineModal,
  openCreateInviteModal,
  timelineId
}: Props) {
  const navigate = useNavigate()
  
  return (
    <Group>
      <Button aria-label="friends" variant="transparent" size="xs" onClick={() => {
        navigate("/friends")
      }}>
        <IconUsers />
      </Button>
      <Button aria-label="add friend" variant="transparent" size="xs" onClick={openFriendModal}>
        <IconUserPlus />
      </Button>
      <Button aria-label="create timeline" variant="transparent" size="xs" onClick={openCreateTimelineModal}>
        <IconArrowRightDashed />
      </Button>
      <Button aria-label="join timeline" variant="transparent" size="xs" onClick={openJoinTimelineModal}>
        <IconTrendingUp2 />
      </Button>
      {timelineId && (
        <>
          <Divider orientation="vertical" />
          <Button aria-label="create invite" variant="transparent" size="xs" onClick={openCreateInviteModal}>
            <IconTrendingUp2 />
          </Button>
        </>
      )}
      <Divider orientation="vertical" />
      <Button
        aria-label="logout"
        variant="transparent"
        size="xs"
        onClick={() => {
          localStorage.removeItem("authToken")
          navigate("/login")
      }}>
        <IconLogout color="var(--mantine-color-red-filled)" />
      </Button>

    </Group>
  )
}

export default ToolbarLg
