import { Button, Center, Modal, Stack, TextInput } from "@mantine/core"
import { useForm } from "@mantine/form"

interface Props {
  opened: boolean
  close: () => void
  trigger: (value: string) => void
}

function JoinTimeline({ opened, close, trigger }: Props) {
  const timelineForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      code: ""
    },
    validate: {
      code: (value) => value.length > 0 ? null : "Timeline can't be empty"
    }
  })

  return (
    <Modal opened={opened} onClose={close} title="Join Timeline">
      <Modal.Body>
        <form onSubmit={timelineForm.onSubmit((values) => {
          fetch(import.meta.env.VITE_API_URL!.concat(`invite/${values.code}/`), {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `jwt ${localStorage.getItem("authToken")}`
            },
          })
            .then(response => {
              if (!response.ok) {
                throw new Error("Timeline does not exist")
              }
              trigger((new Date()).toISOString())
              close()
            })
        })}>
          <Stack>
            <TextInput
              placeholder="Invite Code"
              key={timelineForm.key("code")}
              {...timelineForm.getInputProps("code")}
            />
            <Center>
              <Button type="submit" variant="light">Join Timeline!</Button>
            </Center>
          </Stack>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default JoinTimeline
