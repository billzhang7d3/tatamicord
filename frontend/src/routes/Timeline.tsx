import { AppShell, Box, Burger, Button, Group, Paper, ScrollArea, } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { Channel, Message, Timeline } from "../types"
import FriendRequestMobile from "../components/FriendRequestMobile"
import TimelineBar from "../components/TimelineBar"
import fetchTimelines from "../api/fetchTimelines"
import fetchChannels from "../api/fetchChannels"
import ToolbarSm from "../components/ToolbarSm"
import { IconSettings } from "@tabler/icons-react"
import CreateTimeline from "../components/CreateTimeline"
import fetchChannelMessages from "../api/fetchChannelMessages"
import ChannelMessageBox from "../components/ChannelMessageBox"
import MessageList from "../components/MessageList"
import CreateChannel from "../components/CreateChannel"
import ChannelList from "../components/ChannelList"
import JoinTimeline from "../components/JoinTimeline"
import CreateInvite from "../components/CreateInvite"
import ToolbarLg from "../components/ToolbarLg"

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
  const [createTimelinePage, {open: ct_open, close: ct_close}] = useDisclosure()
  const [joinTimelinePage, {open: jt_open, close: jt_close}] = useDisclosure()
  const [createInvitePage, {open: ci_open, close: ci_close}] = useDisclosure()
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
          <CreateTimeline opened={createTimelinePage} close={ct_close} trigger={setTimelineTrigger}/>
          <JoinTimeline opened={joinTimelinePage} close={jt_close} trigger={setTimelineTrigger} />
          <CreateInvite opened={createInvitePage} close={ci_close} timelineId={timelineId!} />
          <Box hiddenFrom="lg">
            <ToolbarSm
              openFriendModal={fr_open}
              openCreateTimelineModal={ct_open}
              openJoinTimelineModal={jt_open}
              openCreateInviteModal={ci_open}
              timelineId={timelineId}
            />
          </Box>
          <Box visibleFrom="lg">
            <ToolbarLg
              openFriendModal={fr_open}
              openCreateTimelineModal={ct_open}
              openJoinTimelineModal={jt_open}
              openCreateInviteModal={ci_open}
              timelineId={timelineId}
            />
          </Box>
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
