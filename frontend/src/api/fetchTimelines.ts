import { Timeline } from "../types"

interface TimelineFromRequest {
    id: string
    name: string
    owner: string
    default_channel: string
}

async function fetchTimelines(): Promise<Timeline[]> {
    const response = await fetch(import.meta.env.VITE_API_URL!.concat("timeline/"), {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `jwt ${localStorage.getItem("authToken")}`
        }
    })
    if (!response.ok) {
        throw new Error("Failed to fetch timelines")
    }
    const result = await response.json()
    return result.map((timeline: TimelineFromRequest) => {
        return {
            id: timeline.id,
            name: timeline.name,
            owner: timeline.owner,
            defaultChannel: timeline.default_channel
        }
    })
}

export default fetchTimelines