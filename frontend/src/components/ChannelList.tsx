import { Avatar, NavLink, ScrollArea } from "@mantine/core"
import { Channel } from "../types"
import { useNavigate } from "react-router-dom"

interface Props {
  timelineId: string
  channelList: Channel[]
  toggle: () => void
}

function ChannelList({ timelineId, channelList, toggle }: Props) {
  const navigate = useNavigate()
  return (
    <ScrollArea>
      {channelList.map(channel =>
        <NavLink
          label={`#${channel.name}`}
          key={channel.id}
          leftSection={<Avatar radius="xl" />}
          onClick={() => {
            navigate(`/timeline/${timelineId}/${channel.id}`)
            toggle()
          }}
        />
      )}
    </ScrollArea>
  )
}

export default ChannelList
