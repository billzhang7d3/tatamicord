import { AppShell, Burger, Button, Group } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useEffect, useState } from "react"
import TimelineBar from "../components/TimelineBar"
import { IconSettings } from "@tabler/icons-react"
import ToolbarMobile from "../components/ToolbarMobile"
import FriendRequestMobile from "../components/FriendRequestMobile"
import { DirectMessageInfo, Timeline } from "../types"
import DirectMessageList from "../components/DirectMessageList"
import fetchTimelines from "../api/fetchTimelines"
import fetchDirectMessages from "../api/fetchDirectMessages"

const homeItself = [{
    id: "00000000-0000-0000-0000-000000000000",
    name: "Home"
}]

function HomePage() {
  const [opened, {toggle}] = useDisclosure();
  const [friendRequestPage, {open, close}] = useDisclosure()
  const [timelineIndex, setTimelineIndex] = useState<number>(0)
  const [timelineList, setTimelineList] = useState<Timeline[]>(homeItself);
  const [dmList, setDmList] = useState<DirectMessageInfo[]>([])
  useEffect(() => {
    fetchTimelines()
      .then((result) => {
        setTimelineList(homeItself.concat(result))
      })
    fetchDirectMessages()
      .then((result) => {
        setDmList(result)
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
      <AppShell.Navbar p="md">
        <DirectMessageList dmList={dmList} />
      </AppShell.Navbar>
      <AppShell.Main />
      <AppShell.Footer />
    </AppShell>
  )
}

export default HomePage
