import { Group, Textarea } from "@mantine/core"
import { useState } from "react"
import { IconCirclePlus, IconSend2 } from '@tabler/icons-react'

function MessageBox() {
  const [message, setMessage] = useState("");
  return (
    <Group h="100%" px="md">
      <IconCirclePlus />
      <Textarea
        value={message}
        autosize
        minRows={1}
        maxRows={5}
        onChange={(event) => setMessage(event.target.value)}
        style={{flex: 1}}
        placeholder="Message"
      />
      <IconSend2 />
    </Group>
  )
}

export default MessageBox
