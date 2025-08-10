import { Channel } from "../types"

async function fetchChannels(timeline_id: string): Promise<Channel[]> {
    const response = await fetch(import.meta.env.VITE_API_URL!.concat(`channel/${timeline_id}/`), {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `jwt ${localStorage.getItem("authToken")}`
        }
    })
    if (!response.ok) {
        throw new Error("Failed to fetch channels")
    }
    return response.json()
}

export default fetchChannels
