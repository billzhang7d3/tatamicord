import { Button, Center, Modal, TextInput, Text, Stack, Box } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";

enum SubmitResponse {
  NotSubmitted = 1,
  Sent,
  AlreadyFriends,
  FriendRequestExists,
  FriendNotFound
}

interface Props {
  opened: boolean
  close: () => void
}

interface FriendRequestInfo {
  username: string
  tag: string
}

const MAX_USERNAME_LENGTH = 32

const correctUsernameLength = (value: String) => {
  return value.length > 0 && value.length <= MAX_USERNAME_LENGTH
}

const isFourDigitNumber = (value: String) => {
  return value.length === 4 && !isNaN(Number(value))
}

function FriendRequestMobile({ opened, close }: Props) {
  const [submitState, setSubmitState] = useState<SubmitResponse>(SubmitResponse.NotSubmitted)
  const friendForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      username: "",
      tag: ""
    },
    validate: {
      username: (value) => correctUsernameLength(value) ? null : "Username must be between 1 and 32 characters",
      tag: (value) => isFourDigitNumber(value) ? null : "# must be a four-digit number"
    }
  })


  return (
    <Modal opened={opened} onClose={close} title="Send a Friend Request">
      <Modal.Body>
        <form onSubmit={friendForm.onSubmit(async (values) => {
          const result = await sendFriendRequest(values)
          switch (result) {
            case 200:
              setSubmitState(SubmitResponse.Sent)
              break
            case 403:
              setSubmitState(SubmitResponse.AlreadyFriends)
              break
            case 409:
              setSubmitState(SubmitResponse.FriendRequestExists)
              break
            case 404:
              setSubmitState(SubmitResponse.FriendNotFound)
              break
          }
        })}>
          <Stack>
            <Box>
              <TextInput
                placeholder="Username"
                key={friendForm.key("username")}
                {...friendForm.getInputProps("username")}
              />
              <TextInput
                placeholder="#"
                key={friendForm.key("tag")}
                {...friendForm.getInputProps("tag")}
              />
            </Box>
            <Center>
              <Button type="submit" variant="light">Send Friend Request</Button>
            </Center>
          </Stack>
        </form>
        {submitState === SubmitResponse.Sent &&
          <Text size="sm" c="green">Friend request sent!</Text>}
        {submitState === SubmitResponse.AlreadyFriends &&
          <Text size="sm" c="red">You're already friends with that user!</Text>}
        {submitState === SubmitResponse.FriendRequestExists &&
          <Text size="sm" c="red">You've already sent that user a friend request!</Text>}
        {submitState === SubmitResponse.FriendNotFound &&
          <Text size="sm" c="red">User not found.</Text>}
      </Modal.Body>
    </Modal>
  )
}

async function sendFriendRequest(friendRequestInfo: FriendRequestInfo) {
  const response = await fetch(import.meta.env.VITE_API_URL!.concat("friend-request/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `jwt ${localStorage.getItem("authToken")}`
    },
    body: JSON.stringify(friendRequestInfo)
  })
  return response.status
} 

export default FriendRequestMobile
