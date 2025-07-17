import { Box, Button, Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Timeline } from "./Home";

interface Props {
  timelineList: Timeline[],
  timelineIndex: number
  setTimelineIndex: (_: number) => void
}

function TimelineBar({ timelineList, timelineIndex, setTimelineIndex }: Props) {
  const [opened, {open, close}] = useDisclosure(false);
  return (
    <Box style={{flex: 1, maxWidth: "500px", margin: "auto"}}>
      <Modal opened={opened} onClose={close} centered>
        <Text>
          placeholder for fetched timelines
        </Text>
      </Modal>
      <Button variant="light" onClick={open} style={{width: "100%"}} >
        {timelineList[timelineIndex].name}
      </Button>
    </Box>
  )
}

export default TimelineBar;