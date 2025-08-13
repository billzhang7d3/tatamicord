import { AppShell, Avatar, Box, Button, Group, Menu, Stack, Tabs, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconArrowBackUp, IconDotsVertical, IconSettings, IconUserPlus, IconUserX } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Member } from "../types"
import fetchFriends from "../api/fetchFriends"

const [CURRENT, INCOMING, OUTGOING] =
    ["friend/", "incoming-friend-requests/", "outgoing-friend-requests/"]

function FriendsPage() {
  const navigate = useNavigate()
  const [opened] = useDisclosure()
  const [friendsList, setFriendsList] = useState<Member[]>([])
  const [incomingRequestsList, setIncomingRequestsList] = useState<Member[]>([])
  const [outgoingRequestsList, setOutgoingRequestsList] = useState<Member[]>([])
  const [triggerFriends, setTriggerFriends] = useState<boolean>(false)
  const [triggerIncoming, setTriggerIncoming] = useState<boolean>(false)
  const [triggerOutgoing, setTriggerOutgoing] = useState<boolean>(false)
  useEffect(() => {
    // fetch friends list
    fetchFriends(CURRENT)
      .then(result => {
        setFriendsList(result)
      })
  }, [triggerFriends])
  useEffect(() => {
    // fetch incoming friends
    fetchFriends(INCOMING)
      .then(result => {
        setIncomingRequestsList(result)
      })
  }, [triggerIncoming])
  useEffect(() => {
    // fetch incoming friends
    fetchFriends(OUTGOING)
      .then(result => {
        setOutgoingRequestsList(result)
      })
  }, [triggerOutgoing])
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Button
            aria-label="Go back"
            variant="transparent"
            size="xs"
            onClick={() => {
              navigate(-1)
            }}
          >
            <IconArrowBackUp />
          </Button>
          <Button
            aria-label="settings"
            variant="transparent"
            size="xs"
            style={{marginLeft: "auto", marginRight: 0}}
          >
            <IconSettings />
          </Button>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Tabs defaultValue="Friends">
          <Tabs.List>
            <Tabs.Tab value="Friends">
              Friends
            </Tabs.Tab>
            <Tabs.Tab value="Friend Requests">
              Friend Requests
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="Friends">
            <Stack style={{paddingTop: "1em"}}>
              {friendsList.map(friend => 
                <Group h="100%" px="md" key={friend.id}>
                  <Avatar name={friend.username} color="initials" />
                  <Text>{friend.username}</Text>
                  <Menu shadow="md">
                    <Menu.Target>
                      <Button
                        variant="transparent"
                        aria-label={`more settings with friend ${friend.username}`}
                        style={{marginLeft: "auto", marginRight: 0}}
                      >
                        <IconDotsVertical />
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item onClick={() => {
                        navigate(`/direct-message/${friend.id}`)
                      }}>
                        <Text>
                          Message
                        </Text>
                      </Menu.Item>
                      <Menu.Item onClick={() => {
                        fetch(import.meta.env.VITE_API_URL!.concat(`friend/${friend.id}/`), {
                          method: "DELETE",
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `jwt ${localStorage.getItem("authToken")}`
                          }
                        })
                        .then(() => setTriggerFriends(!triggerFriends))
                      }}>
                        <Text c="red">
                          Remove Friend
                        </Text>
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              )}
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value="Friend Requests">
            <Stack style={{paddingTop: "1em"}}>
              {incomingRequestsList.map(member => 
                <Group h="100%" px="md" key={member.id}>
                  <Avatar name={member.username} color="initials" />
                  <Text>{member.username}</Text>
                  <Box style={{marginLeft: "auto", marginRight: 0}}>
                    <Button
                      variant="transparent"
                      aria-label={`accept friend request from ${member.username}`}
                      onClick={() => {
                        fetch(import.meta.env.VITE_API_URL!.concat(`friend-request/${member.id}/`), {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `jwt ${localStorage.getItem("authToken")}`
                          }
                        })
                        .then(() => setTriggerFriends(!triggerFriends))
                        .then(() => setTriggerIncoming(!triggerIncoming))
                        fetch(import.meta.env.VITE_API_URL!.concat("direct-message/"), {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `jwt ${localStorage.getItem("authToken")}`
                          },
                          body: JSON.stringify({ id: member.id })
                        })
                      }}
                    >
                      <IconUserPlus />
                    </Button>
                    <Button
                      variant="transparent"
                      aria-label={`reject friend request from ${member.username}`}
                      onClick={() => {
                        fetch(import.meta.env.VITE_API_URL!.concat(`friend-request/${member.id}/`), {
                          method: "DELETE",
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `jwt ${localStorage.getItem("authToken")}`
                          }
                        })
                        .then(() => setTriggerIncoming(!triggerIncoming))
                      }}
                      style={{marginLeft: "auto", marginRight: 0}}
                    >
                      <IconUserX />
                    </Button>
                  </Box>
                </Group>
              )}
              {outgoingRequestsList.map(member => 
                <Group h="100%" px="md" key={member.id}>
                  <Avatar name={member.username} color="initials" />
                  <Text>{member.username}</Text>
                  <Button
                    variant="transparent"
                    aria-label={`revoke friend request to ${member.username}`}
                    style={{marginLeft: "auto", marginRight: 0}}
                    onClick={() => {
                      fetch(import.meta.env.VITE_API_URL!.concat(`friend-request/${member.id}/`), {
                        method: "DELETE",
                        headers: {
                          "Content-Type": "application/json",
                          "Authorization": `jwt ${localStorage.getItem("authToken")}`
                        }
                      })
                        .then(() => setTriggerOutgoing(!triggerOutgoing))
                    }}
                  >
                    <IconUserX />
                  </Button>
                </Group>
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </AppShell.Main>
      <AppShell.Footer />
    </AppShell>
  )

}

export default FriendsPage;