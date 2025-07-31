import { AppShell, Avatar, Burger, Button, Group, Stack, Text, UnstyledButton } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useEffect, useState } from "react"
import TimelineBar from "../components/TimelineBar"
// import { useNavigate } from "react-router-dom"
import { IconSettings } from "@tabler/icons-react"
import MessageBox from "../components/MessageBox"
import ToolbarMobile from "../components/ToolbarMobile"
import FriendRequestMobile from "../components/FriendRequestMobile"
import { DirectMessageInfo, Timeline } from "../types"

const homeItself = [{
    id: "00000000-0000-0000-0000-000000000000",
    name: "Home"
}]

function HomePage() {
  const [opened, {toggle}] = useDisclosure();
  const [friendRequestPage, {open, close}] = useDisclosure()
  const [timelineIndex, setTimelineIndex] = useState<number>(0)
  const [timelineList, setTimelineList] = useState<Timeline[]>(homeItself);
  // const [currentDmIndex, setCurrentDmIndex] = useState<number>(0)
  const [dmList, setDmList] = useState<DirectMessageInfo[]>([])
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
      <AppShell.Navbar p="md">
        <Stack justify="flex-start" align="flex-start">
          {dmList.map(dm =>
            <UnstyledButton key={dm.id} style={{ width: "100%" }}>
              <Group>
                <Avatar radius="xl" />
                <Text>
                  {dm.receiver.username}
                </Text>
              </Group>
            </UnstyledButton>
          )}
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main />
      <AppShell.Footer>
        {!opened && <MessageBox /> }
      </AppShell.Footer>
    </AppShell>
  )
}

export default HomePage
