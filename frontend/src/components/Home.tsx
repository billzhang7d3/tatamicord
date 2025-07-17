import { AppShell, Burger, Group } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import TimelineBar from "./TimelineBar";
// import { useNavigate } from "react-router-dom";
import { IconSettings } from '@tabler/icons-react';
import MessageBox from "./MessageBox";

export interface Timeline {
  id: string,
  name: string
}

function HomePage() {
  // const navigate = useNavigate();
  const [opened, {toggle}] = useDisclosure();
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [timelineList, setTimelineList] = useState([{
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
        setTimelineList(timelineList.concat(result.result))
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
          <IconSettings />
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