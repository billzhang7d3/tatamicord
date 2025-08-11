import { AppShell, Avatar, Burger, Button, Group, NavLink, Stack } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Channel, Timeline } from "../types"
import FriendRequestMobile from "../components/FriendRequestMobile"
import TimelineBar from "../components/TimelineBar"
import fetchTimelines from "../api/fetchTimelines"
import fetchChannels from "../api/fetchChannels"
import ToolbarMobile from "../components/ToolbarMobile"
import { IconSettings } from "@tabler/icons-react"
import CreateTimeline from "../components/CreateTimeline"

const homeItself = [{
    id: "00000000-0000-0000-0000-000000000000",
    name: "Home",
    owner: "",
    defaultChannel: ""
}]

function TimelinePage() {
  const { timelineId, channelId } = useParams()
	const navigate = useNavigate()
	const [currentTimeline, setCurrentTimeline] = useState<Timeline | undefined>(undefined)
	const [opened, {toggle}] = useDisclosure()
	const [timelineList, setTimelineList] = useState<Timeline[]>([])
  const [channelList, setChannelList] = useState<Channel[]>([])
  const [friendRequestPage, {open: fr_open, close: fr_close}] = useDisclosure()
  const [createTimelinePage, {open: t_open, close: t_close}] = useDisclosure()
	useEffect(() => {
    fetchTimelines()
      .then((result) => {
				const newTimelineList = homeItself.concat(result)
        setTimelineList(newTimelineList)
				setCurrentTimeline(newTimelineList.find(timeline => timeline.id === timelineId))
      })
  }, [])
	useEffect(() => {
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
            currentTimeline={currentTimeline}
          />
					<FriendRequestMobile opened={friendRequestPage} close={fr_close} />
          <CreateTimeline opened={createTimelinePage} close={t_close} />
					<ToolbarMobile openFriendModal={fr_open} openTimelineModal={t_open}/>
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