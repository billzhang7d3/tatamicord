import { Box, Button, Modal, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { Timeline } from "../types"
import { useNavigate } from "react-router-dom"

interface Props {
  timelineList: Timeline[],
  timelineIndex: number
  setTimelineIndex: (_: number) => void
}

function TimelineBar({ timelineList, timelineIndex, setTimelineIndex }: Props) {
  const navigate = useNavigate()
  // console.log(timelineList);
  const [opened, {open, close}] = useDisclosure(false);
  return (
    <Box style={{flex: 1, maxWidth: "500px", margin: "auto"}}>
      <Modal opened={opened} onClose={close} centered title="Timelines">
        {timelineList.map((timeline, index) => 
          <Button
            fullWidth
            justify="left"
            variant="subtle"
            radius="xs"
            key={timeline.id}
            onClick={() => {
              navigate(`/timeline/${timeline.id}/${timeline.defaultChannel}`)
              setTimelineIndex(index)
              close()
            }}
          >
            <Text>
              {timeline.name}
            </Text>
          </Button>
        )}
      </Modal>
      <Button variant="light" onClick={open} style={{width: "100%"}}>
        {timelineList[timelineIndex].name}
      </Button>
    </Box>
  )
}

export default TimelineBar;