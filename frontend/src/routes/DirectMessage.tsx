import { useEffect, useRef, useState } from "react"
import { DirectMessageInfo, Message, Timeline } from "../types"
import { AppShell, Burger, Button, Group, Box, Paper, ScrollArea } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useParams } from "react-router-dom"
import TimelineBar from "../components/TimelineBar"
import FriendRequestMobile from "../components/FriendRequestMobile"
import ToolbarMobile from "../components/ToolbarMobile"
import { IconSettings } from "@tabler/icons-react"
import DirectMessageList from "../components/DirectMessageList"
import fetchTimelines from "../api/fetchTimelines"
import fetchDirectMessages from "../api/fetchDirectMessages"
import fetchDmMessages from "../api/fetchDmMessages"
import CreateTimeline from "../components/CreateTimeline"
import DirectMessageBox from "../components/DirectMessageBox"
import MessageList from "../components/MessageList"

const homeItself: Timeline[] = [{
    id: "00000000-0000-0000-0000-000000000000",
    name: "Home",
    owner: "",
    defaultChannel: ""
}]

function DirectMessagePage() {
  const { id } = useParams()
  const [opened, {toggle}] = useDisclosure()
  const [friendRequestPage, {open: fr_open, close: fr_close}] = useDisclosure()
  const [createTimelinePage, {open: t_open, close: t_close}] = useDisclosure()
  const [dmList, setDmList] = useState<DirectMessageInfo[]>([])
  const [timelineList, setTimelineList] = useState<Timeline[]>(homeItself)
  const [messageList, setMessageList] = useState<Message[]>([])
  const [recentMessageTimestamp, setRecentMessageTimestamp] = useState((new Date()).toISOString())
  const [timelineTrigger, setTimelineTrigger] = useState((new Date()).toISOString())
  const [messagesHeight, setMessagesHeight] = useState(window.innerHeight)
  const messagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchTimelines()
      .then((result) => {
        setTimelineList(homeItself.concat(result))
      })
  }, [timelineTrigger])
  useEffect(() => {
    fetchDirectMessages()
      .then((result) => {
        setDmList(result)
      })
  }, [])
  useEffect(() => {
    fetchDmMessages(id!)
      .then((result) => {
        setMessageList(result)
        messagesRef.current?.scrollTo({ top: messagesRef.current?.scrollHeight });
      })
  }, [id, recentMessageTimestamp])
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
      layout="default"
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
            currentTimeline={homeItself[0]}

          />
          <FriendRequestMobile opened={friendRequestPage} close={fr_close} />
          <CreateTimeline opened={createTimelinePage} close={t_close} trigger={setTimelineTrigger} />
          <ToolbarMobile openFriendModal={fr_open} openTimelineModal={t_open}/>
          <Button aria-label="settings" variant="transparent" size="xs">
            <IconSettings />
          </Button>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar>
        <DirectMessageList dmList={dmList} toggle={toggle} />
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
            <DirectMessageBox receiver={id!} timestampSetter={setRecentMessageTimestamp} />
          </Paper>
        </Box>
      </AppShell.Main>
    </AppShell>
  )
}

export default DirectMessagePage
