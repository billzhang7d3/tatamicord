import { AppShell, Box, Burger, Button, Group, Paper, ScrollArea, } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { Channel, Message, Timeline } from "../types"
import FriendRequestMobile from "../components/FriendRequestMobile"
import TimelineBar from "../components/TimelineBar"
import fetchTimelines from "../api/fetchTimelines"
import fetchChannels from "../api/fetchChannels"
import ToolbarMobile from "../components/ToolbarMobile"
import { IconSettings } from "@tabler/icons-react"
import CreateTimeline from "../components/CreateTimeline"
import fetchChannelMessages from "../api/fetchChannelMessages"
import ChannelMessageBox from "../components/ChannelMessageBox"
import MessageList from "../components/MessageList"
import CreateChannel from "../components/CreateChannel"
import ChannelList from "../components/ChannelList"

const homeItself = [{
    id: "00000000-0000-0000-0000-000000000000",
    name: "Home",
    owner: "",
    defaultChannel: ""
}]

function TimelinePage() {
  const { timelineId, channelId } = useParams()
	const [currentTimeline, setCurrentTimeline] = useState<Timeline | undefined>(undefined)
	const [opened, {toggle}] = useDisclosure()
	const [timelineList, setTimelineList] = useState<Timeline[]>([])
  const [channelList, setChannelList] = useState<Channel[]>([])
	const [messageList, setMessageList] = useState<Message[]>([])
  const [recentMessageTimestamp, setRecentMessageTimestamp] = useState((new Date()).toISOString())
  const [friendRequestPage, {open: fr_open, close: fr_close}] = useDisclosure()
  const [createTimelinePage, {open: t_open, close: t_close}] = useDisclosure()
  const [timelineTrigger, setTimelineTrigger] = useState((new Date()).toISOString())
  const [channelTrigger, setChannelTrigger] = useState((new Date()).toISOString())
  const [messagesHeight, setMessagesHeight] = useState(window.innerHeight)
  const messagesRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
    fetchTimelines()
      .then((result) => {
				const newTimelineList = homeItself.concat(result)
        setTimelineList(newTimelineList)
				setCurrentTimeline(newTimelineList.find(timeline => timeline.id === timelineId))
      })
  }, [timelineId, timelineTrigger])
	useEffect(() => {
    fetchChannels(timelineId!)
      .then((result) => {
        setChannelList(result)
      })
  }, [timelineId, channelTrigger])
	useEffect(() => {
		fetchChannelMessages(channelId!)
			.then((result) => {
				setMessageList(result)
        messagesRef.current?.scrollTo({ top: messagesRef.current?.scrollHeight });
			})
	}, [channelId, recentMessageTimestamp])
  useEffect(() => {
    const handleResize = () => setMessagesHeight(window.innerHeight)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
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
          <CreateTimeline opened={createTimelinePage} close={t_close} trigger={setTimelineTrigger}/>
					<ToolbarMobile openFriendModal={fr_open} openTimelineModal={t_open}/>
					<Button aria-label="settings" variant="transparent" size="xs">
            <IconSettings />
          </Button>
				</Group>
			</AppShell.Header>
			<AppShell.Navbar>
				<CreateChannel timelineId={timelineId!} channelTrigger={setChannelTrigger} />
				<ChannelList timelineId={timelineId!} channelList={channelList} toggle={toggle} />
			</AppShell.Navbar>
			<AppShell.Main>
				<ScrollArea
					h={messagesHeight - 160}
					viewportRef={messagesRef}
					style={{ flex: 1, wordBreak: "break-word", whiteSpace: "normal" }}
				>
					<MessageList messageList={messageList} />
				</ScrollArea>
        <Box component="footer" mt="auto" style={{
          position: "sticky",
          bottom: "0px",
          width: "100%",
          height: "60px",
          minWidth: 0
        }}>
          <Paper shadow="xs" radius="md" p="xs">
            <ChannelMessageBox channel={channelId!} timestampSetter={setRecentMessageTimestamp} />
          </Paper>
        </Box>
			</AppShell.Main>
		</AppShell>
	)
}

export default TimelinePage
