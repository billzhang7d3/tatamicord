import { Avatar, Box, Flex, Group, Text } from "@mantine/core"
import { Message } from "../types"
import dateFormat from "../util/dateFormat"

interface Props {
  messageList: Message[]
}

function MessageList({ messageList }: Props) {
  return (
    <>
      {messageList.map(message =>
        <Flex
          key={message.id}
          gap="md"
          wrap="nowrap"
        >
          <Box style={{verticalAlign: "top"}}>
            <Avatar radius="xl" />
          </Box>
          <Box style={{ position: 'static' }}>
            <Group gap="xs">
              <Text fw={700}>
                {message.sender.username}
              </Text>
              <Text size="xs">
                {dateFormat(message.time_sent)}
              </Text>
            </Group>
            <Box>
              <Text>
                {message.content}
              </Text>
            </Box>
          </Box>
        </Flex>
      )}
    </>
  )
}

export default MessageList
