import { useEffect, useState } from "react"
import { DirectMessageInfo, Message, Timeline } from "../types"
import { AppShell, Burger, Button, Group, Avatar, Box, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useParams } from "react-router-dom"
import TimelineBar from "../components/TimelineBar"
import FriendRequestMobile from "../components/FriendRequestMobile"
import ToolbarMobile from "../components/ToolbarMobile"
import { IconSettings } from "@tabler/icons-react"
import MessageBox from "../components/MessageBox"
import DirectMessageList from "../components/DirectMessageList"
import fetchTimelines from "../api/fetchTimelines"
import fetchDirectMessages from "../api/fetchDirectMessages"
import fetchDmMessages from "../api/fetchDmMessages"

const homeItself = [{
    id: "00000000-0000-0000-0000-000000000000",
    name: "Home"
}]

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

function dateFormat(isoDate: string): string {
  const date = new Date(isoDate)
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

function DirectMessagePage() {
  const { id } = useParams()
  const [opened, {toggle}] = useDisclosure();
  const [friendRequestPage, {open, close}] = useDisclosure()
  const [dmList, setDmList] = useState<DirectMessageInfo[]>([])
  const [timelineIndex, setTimelineIndex] = useState<number>(0)
  const [timelineList, setTimelineList] = useState<Timeline[]>(homeItself)
  const [messageList, setMessageList] = useState<Message[]>([])
  useEffect(() => {
    fetchTimelines()
      .then((result) => {
        setTimelineList(homeItself.concat(result))
      })
    fetchDirectMessages()
      .then((result) => {
        setDmList(result)
      })
    fetchDmMessages(id!)
      .then((result) => {
        setMessageList(result)
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
            timelineIndex={timelineIndex}
            setTimelineIndex={setTimelineIndex}
          />
          <FriendRequestMobile opened={friendRequestPage} close={close} />
          <ToolbarMobile open={open}/>
          <Button aria-label="settings" variant="transparent" size="xs">
            <IconSettings />
          </Button>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar>
        <DirectMessageList dmList={dmList} />
      </AppShell.Navbar>
      <AppShell.Main>
        {messageList.map(message => 
          <Group key={message.id}>
            <Avatar radius="xl" />
            <Box>
              <Text size="xs">
                {dateFormat(message.time_sent)}
              </Text>
              <Text>
                {message.content}
              </Text>
            </Box>
          </Group>
        )}
      </AppShell.Main>
      <AppShell.Footer>
        <MessageBox />
      </AppShell.Footer>
    </AppShell>
  )
}

export default DirectMessagePage
