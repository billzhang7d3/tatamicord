import { Timeline } from "../types"

interface FetchType {
    id: string,
    name: string,
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
    return result.map((item: FetchType) => {
        return {
            "id": item.id,
            "name": item.name,
            "defaultChannel": item.default_channel
        }
    })
}

export default fetchTimelines