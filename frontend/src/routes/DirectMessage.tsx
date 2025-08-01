import { useEffect, useState } from "react"
import { DirectMessageInfo, Message, Timeline } from "../types"
import { AppShell, Burger, Button, Group, Stack, NavLink, Avatar, Box, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useNavigate, useParams } from "react-router-dom"
import TimelineBar from "../components/TimelineBar"
import FriendRequestMobile from "../components/FriendRequestMobile"
import ToolbarMobile from "../components/ToolbarMobile"
import { IconSettings } from "@tabler/icons-react"
import App from "../App"
import MessageBox from "../components/MessageBox"

const homeItself = [{
    id: "00000000-0000-0000-0000-000000000000",
    name: "Home"
}]

function DirectMessagePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [opened, {toggle}] = useDisclosure();
  const [friendRequestPage, {open, close}] = useDisclosure()
  const [currentDmIndex, setCurrentDmIndex] = useState<number>(0)
  const [dmList, setDmList] = useState<DirectMessageInfo[]>([])
  const [timelineIndex, setTimelineIndex] = useState<number>(0)
  const [timelineList, setTimelineList] = useState<Timeline[]>(homeItself)
  const [messageList, setMessageList] = useState<Message[]>([])
  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL!.concat("timeline/"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `jwt ${localStorage.getItem("authToken")}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch timelines")
        }
        return response.json()
      })
      .then((result) => {
        if (result.length > 0) {
          setTimelineList(homeItself.concat(result))
        }
      })
      .catch()
    fetch(import.meta.env.VITE_API_URL!.concat("direct-message/"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `jwt ${localStorage.getItem("authToken")}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch direct messages")
        }
        return response.json()
      })
      .then((result) => {
        if (result.length > 0) {
          setDmList(result)
        }
      })
      .catch()
    fetch(import.meta.env.VITE_API_URL!.concat(`direct-message/${id}/`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `jwt ${localStorage.getItem("authToken")}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch direct messages")
        }
        return response.json()
      })
      .then((result) => {
        if (result.length > 0) {
          setMessageList(result)
        }
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
        <Stack justify="flex-start" align="flex-start">
          {dmList.map(dm =>
            <NavLink
              label={dm.receiver.username}
              key={dm.id}
              leftSection={<Avatar radius="xl" />}
              onClick={() => {
                navigate(`/direct-message/${dm.receiver.id}`)
              }}
            />
          )}
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main>
        {messageList.map(message => 
          <Group id={message.id}>
            <Avatar radius="xl" />
            <Box>
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
