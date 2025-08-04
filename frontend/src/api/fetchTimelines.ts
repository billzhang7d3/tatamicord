import { Timeline } from "../types"

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
    return response.json()
}

export default fetchTimelines