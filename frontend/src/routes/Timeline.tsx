import { AppShell, Avatar, Box, Burger, Button, Center, Flex, Group, Modal, NavLink, Paper, ScrollArea, Stack, Text, TextInput } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Channel, Message, Timeline } from "../types"
import FriendRequestMobile from "../components/FriendRequestMobile"
import TimelineBar from "../components/TimelineBar"
import fetchTimelines from "../api/fetchTimelines"
import fetchChannels from "../api/fetchChannels"
import ToolbarMobile from "../components/ToolbarMobile"
import { IconSettings } from "@tabler/icons-react"
import CreateTimeline from "../components/CreateTimeline"
import { useForm } from "@mantine/form"
import fetchChannelMessages from "../api/fetchChannelMessages"
import dateFormat from "../util/dateFormat"
import ChannelMessageBox from "../components/ChannelMessageBox"

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
	const [messageList, setMessageList] = useState<Message[]>([])
  const [recentMessageTimestamp, setRecentMessageTimestamp] = useState((new Date()).toISOString())
  const [friendRequestPage, {open: fr_open, close: fr_close}] = useDisclosure()
  const [createTimelinePage, {open: t_open, close: t_close}] = useDisclosure()
	const [createChannelPage, {open: c_open, close: c_close}] = useDisclosure()
  const [timelineTrigger, setTimelineTrigger] = useState((new Date()).toISOString())
  const [messagesHeight, setMessagesHeight] = useState(window.innerHeight)
  const messagesRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
    fetchTimelines()
      .then((result) => {
				const newTimelineList = homeItself.concat(result)
        setTimelineList(newTimelineList)
				setCurrentTimeline(newTimelineList.find(timeline => timeline.id === timelineId))
      })
  }, [timelineTrigger])
	useEffect(() => {
    fetchChannels(timelineId!)
      .then((result) => {
        setChannelList(result)
      })
  }, [])
	useEffect(() => {
		fetchChannelMessages(channelId!)
			.then((result) => {
				setMessageList(result)
			})
	}, [channelId, recentMessageTimestamp])
  useEffect(() => {
    const handleResize = () => setMessagesHeight(window.innerHeight)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

	const channelForm = useForm({
		mode: "uncontrolled",
		initialValues: {
			name: ""
		},
		validate: {
			name: (value) => value.length > 0 ? null : "Invalid Channel Name"
		}
	})

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
				<Stack justify="flex-start" align="flex-start" gap="xs">
					<Modal opened={createChannelPage} onClose={c_close} title="Create Channel">
						<Modal.Body>
							<form onSubmit={channelForm.onSubmit((values) => {
								fetch(import.meta.env.VITE_API_URL!.concat(`channel/${timelineId}/`), {
									method: "POST",
									headers: {
										"Content-Type": "application/json",
										"Authorization": `jwt ${localStorage.getItem("authToken")}`
									},
									body: JSON.stringify(values)
								})
									.then(response => {
										if (!response.ok) {
											throw new Error("Failed to create channel")
										}
										c_close()
									})
							})}>
								<Stack>
									<TextInput
										placeholder="Channel Name"
										key={channelForm.key("name")}
										{...channelForm.getInputProps("name")}
									/>
									<Center>
										<Button type="submit" variant="light" aria-label="create channel">
											<Text>
												Create Channel
											</Text>
										</Button>
									</Center>
								</Stack>
							</form>
						</Modal.Body>
					</Modal>
					<Button variant="light" onClick={c_open}>
						<Text>
							Create Channel
						</Text>
					</Button>
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
			<AppShell.Main>
				<ScrollArea h={messagesHeight - 160} viewportRef={messagesRef} style={{ flex: 1 }}>
					{messageList.map(message => 
						<Flex
							key={message.id}
							gap="md"
							wrap="nowrap"
							style={{maxWidth: "300px"}}
						>
							<Box style={{verticalAlign: "top"}}>
								<Avatar radius="xl" />
							</Box>
							<Box style={{ position: 'static' }}>
								<Group gap="xs">
									<Text fw={700}>
										{message.sender.username}
									</Text>
									<Text size="xs">
										{dateFormat(message.time_sent)}
									</Text>
								</Group>
								<Box>
									<Text>
										{message.content}
									</Text>
								</Box>
							</Box>
						</Flex>
					)}
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