import { AppShell, Burger, Button, Group } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useEffect, useState } from "react"
import TimelineBar from "../components/TimelineBar"
// import { useNavigate } from "react-router-dom"
import { IconSettings } from '@tabler/icons-react'
import MessageBox from "../components/MessageBox"
import ToolbarMobile from "../components/ToolbarMobile"
import FriendRequestMobile from "../components/FriendRequestMobile"
import { Timeline } from "../types"

function HomePage() {
  const [opened, {toggle}] = useDisclosure();
  const [friendRequestPage, {open, close}] = useDisclosure()
  const [timelineIndex, setTimelineIndex] = useState<number>(0);
  const [timelineList, setTimelineList] = useState<Timeline[]>([{
    id: "00000000-0000-0000-0000-000000000000",
    name: "Home"
  }]);
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
          setTimelineList(timelineList.concat(result))
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
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
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
      <AppShell.Main />
      <AppShell.Footer>
        <MessageBox />
      </AppShell.Footer>
    </AppShell>
  )
}

export default HomePage
