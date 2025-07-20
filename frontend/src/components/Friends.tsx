import { AppShell, Avatar, Box, Burger, Button, Group, Menu, Stack, Tabs, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks";
import { IconDotsVertical, IconSettings, IconUserPlus, IconUserX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export interface Member {
  id: string,
  username: string,
  tag: string
}

const [CURRENT, INCOMING, OUTGOING] =
    ["friend/", "incoming-friend-requests/", "outgoing-friend-requests/"]

function FriendsPage() {
  const [opened, {toggle}] = useDisclosure()
  const [friendsList, setFriendsList] = useState<Member[]>([])
  const [incomingRequestsList, setIncomingRequestsList] = useState<Member[]>([])
  const [outgoingRequestsList, setOutgoingRequestsList] = useState<Member[]>([])
  useEffect(() => {
    // fetch friends list
    fetchFriends(CURRENT)
      .then(result => {
        setFriendsList(result)
      })
      .catch()
    // fetch incoming friends
    fetchFriends(INCOMING)
      .then(result => {
        setIncomingRequestsList(result)
      })
      .catch()
    // fetch incoming friends
    fetchFriends(OUTGOING)
      .then(result => {
        setOutgoingRequestsList(result)
      })
      .catch()
  })
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
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
                        fetch(import.meta.env.VITE_API_URL!.concat(`friend/${friend.id}/`), {
                          method: "DELETE",
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `jwt ${localStorage.getItem("authToken")}`
                          }
                        })
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

async function fetchFriends(friendType: string) {
  const response = await fetch(import.meta.env.VITE_API_URL!.concat(friendType), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `jwt ${localStorage.getItem("authToken")}`
    }
  })
  if (!response.ok) {
    throw new Error("Failed to fetch friends list")
  }
  return await response.json()
}

export default FriendsPage;