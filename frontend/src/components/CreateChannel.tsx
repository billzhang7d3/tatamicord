import { Button, Center, Modal, Stack, Text, TextInput } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useDisclosure } from "@mantine/hooks"

interface Props {
  timelineId: string
  channelTrigger: (arg0: string) => void
}

function CreateChannel({ timelineId, channelTrigger }: Props) {
	const [createChannelPage, {open: c_open, close: c_close}] = useDisclosure()

	const channelForm = useForm({
		mode: "uncontrolled",
		initialValues: {
			name: ""
		},
		validate: {
			name: (value) => value.length > 0 ? null : "Invalid Channel Name"
		}
	})

  return (
    <>
      <Modal opened={createChannelPage} onClose={c_close} title="Create Channel">
        <Modal.Body>
          <form onSubmit={channelForm.onSubmit((values) => {
            fetch(import.meta.env.VITE_API_URL!.concat(`channel/${timelineId}/`), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `jwt ${localStorage.getItem("authToken")}`
              },
              body: JSON.stringify(values)
            })
              .then(response => {
                if (!response.ok) {
                  throw new Error("Failed to create channel")
                }
                channelTrigger((new Date()).toISOString())
                c_close()
              })
          })}>
            <Stack>
              <TextInput
                placeholder="Channel Name"
                key={channelForm.key("name")}
                {...channelForm.getInputProps("name")}
              />
              <Center>
                <Button type="submit" variant="light" aria-label="create channel">
                  <Text>
                    Create Channel
                  </Text>
                </Button>
              </Center>
            </Stack>
          </form>
        </Modal.Body>
      </Modal>
      <Button variant="light" onClick={c_open}>
        <Text>
          Create Channel
        </Text>
      </Button>
    </>
  )
}

export default CreateChannel
