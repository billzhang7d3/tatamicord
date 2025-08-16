import { Group, Textarea, UnstyledButton } from "@mantine/core"
import { useState } from "react"
import { IconCirclePlus, IconSend2 } from '@tabler/icons-react'
import sendChannelMessage from "../api/sendChannelMessage";

interface Props {
  channel: string
  timestampSetter: (timestamp: string) => void
}

function ChannelMessageBox({ channel, timestampSetter }: Props) {
  const [message, setMessage] = useState("");
  const handleSubmit = () => {
    sendChannelMessage(channel, message)
      .then(() => {
        timestampSetter((new Date()).toISOString())
        setMessage("")
      })
  }
  return (
    <Group h="100%" px="md">
      <IconCirclePlus />
      <Textarea
        aria-label="Message box"
        value={message}
        autosize
        minRows={1}
        maxRows={5}
        onChange={(event) => setMessage(event.target.value)}
        style={{flex: 1}}
        placeholder="Message"
      />
      <UnstyledButton
        disabled={message.trim().length === 0}
        aria-label="Send message"
        onClick={handleSubmit}
      >
        <IconSend2 />
      </UnstyledButton>
    </Group>
  )
}

export default ChannelMessageBox
