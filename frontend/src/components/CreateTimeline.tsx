import { Button, Center, Modal, Stack, TextInput } from "@mantine/core"
import { useForm } from "@mantine/form"

interface Props {
  opened: boolean
  close: () => void
}

function CreateTimeline({ opened, close }: Props) {
  const timelineForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: ""
    },
    validate: {
      name: (value) => value.length > 0 ? null : "Timeline name can't be empty"
    }
  })

  return (
    <Modal opened={opened} onClose={close} title="Create Timeline">
      <Modal.Body>
        <form onSubmit={timelineForm.onSubmit((values) => {
          fetch(import.meta.env.VITE_API_URL!.concat("timeline/"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `jwt ${localStorage.getItem("authToken")}`
            },
            body: JSON.stringify(values)
          })
            .then(response => {
              if (!response.ok) {
                throw new Error("Failed to create timeline")
              }
              close()
            })
        })}>
          <Stack>
            <TextInput
              placeholder="Timeline Name"
              key={timelineForm.key("name")}
              {...timelineForm.getInputProps("name")}
            />
            <Center>
              <Button type="submit" variant="light">Create My Timeline!</Button>
            </Center>
          </Stack>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default CreateTimeline
