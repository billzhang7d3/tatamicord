import { Group, Textarea, UnstyledButton } from "@mantine/core"
import { useState } from "react"
import { IconCirclePlus, IconSend2 } from '@tabler/icons-react'
import sendDmMessage from "../api/sendDmMessage";

interface Props {
  receiver: string
  timestampSetter: (timestamp: string) => void
}

function DirectMessageBox({ receiver, timestampSetter }: Props) {
  const [message, setMessage] = useState("");
  const handleSubmit = () => {
    sendDmMessage(receiver, message)
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

export default DirectMessageBox
