import { Button, Center, CopyButton, Modal, Stack, Text, TextInput, UnstyledButton } from "@mantine/core"
import { useState } from "react";

interface Props {
  opened: boolean
  close: () => void
  timelineId: string
}

function CreateInvite({ opened, close, timelineId }: Props) {
  const [code, setCode] = useState<string | null>(null);
  console.log("timelineId", timelineId)
  return (
    <Modal opened={opened} onClose={close}>
      <Modal.Body>
        <Stack>
          <Center>
            <Button
              variant="subtle"
              style={{ maxWidth: 150 }}
              onClick={() => {
                fetch(import.meta.env.VITE_API_URL!.concat("invite/"), {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `jwt ${localStorage.getItem("authToken")}`
                  },
                  body: JSON.stringify({ timeline: timelineId })
                })
                  .then(response => {
                    if (!response.ok) {
                      throw new Error("Could not create invite code")
                    }
                    return response.json()
                  })
                  .then(result => {
                    setCode(result.code)
                  })
              }}
            >
              <Text>
                Create Invite
              </Text>
            </Button>
          </Center>
          {code && (
            <TextInput
              disabled
              placeholder={code}
              rightSection={
                <CopyButton value={code}>
                  {({ copied, copy }) => (
                    <UnstyledButton onClick={copy}>
                      <Text>
                        {copied ? 'copied' : 'copy'}
                      </Text>
                    </UnstyledButton>
                  )}
                </CopyButton>
              }
            />
          )}
        </Stack>
      </Modal.Body>
    </Modal>
  )
}

export default CreateInvite
