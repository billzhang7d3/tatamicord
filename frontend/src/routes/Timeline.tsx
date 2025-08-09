import { AppShell, Avatar, Burger, Button, Group, NavLink, Stack } from "@mantine/core"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import fetchTimelines from "../api/fetchTimelines"
import { Channel, Timeline } from "../types"
import { useDisclosure } from "@mantine/hooks"
import fetchChannels from "../api/fetchChannels"
import TimelineBar from "../components/TimelineBar"
import FriendRequestMobile from "../components/FriendRequestMobile"
import ToolbarMobile from "../components/ToolbarMobile"
import { IconSettings } from "@tabler/icons-react"

const homeItself = [{
    id: "00000000-0000-0000-0000-000000000000",
    name: "Home",
    defaultChannel: ""
}]

function TimelinePage() {
  const { timelineId, channelId } = useParams()
  const navigate = useNavigate()
  const [opened, {toggle}] = useDisclosure()
  const [timelineList, setTimelineList] = useState<Timeline[]>(homeItself)
  const [channelList, setChannelList] = useState<Channel[]>([])
  const [friendRequestPage, {open, close}] = useDisclosure()
  useEffect(() => {
    fetchTimelines()
      .then((result) => {
        setTimelineList(homeItself.concat(result))
      })
  }, [])
  useEffect(() => {
    console.log("useEffect")
    fetchChannels(timelineId!)
      .then((result) => {
        setChannelList(result)
      })
  }, [])
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
            aria-label="menu"
          />
          <TimelineBar
            timelineList={timelineList}
            timelineFocus={timelineList.find(timeline => timeline.id === timelineId)!}
          />
          <FriendRequestMobile opened={friendRequestPage} close={close} />
          <ToolbarMobile open={open}/>
          <Button aria-label="settings" variant="transparent" size="xs">
            <IconSettings />
          </Button>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar>
        <Stack justify="flex-start" align="flex-start" gap="xs">
          {channelList.map(channel =>
            <NavLink
              label={`#${channel.name}`}
              key={channel.id}
              leftSection={<Avatar radius="xl" />}
              onClick={() => {
                navigate(`/timeline/${timelineId}/${channel.id}`)
                toggle()
              }}
            />
          )}
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main />
    </AppShell>
  )
}

export default TimelinePage