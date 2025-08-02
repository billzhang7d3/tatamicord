import { DirectMessageInfo } from "../types"

async function fetchDirectMessages(): Promise<DirectMessageInfo[]> {
    const response = await fetch(import.meta.env.VITE_API_URL!.concat("direct-message/"), {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `jwt ${localStorage.getItem("authToken")}`
        }
    })
    if (!response.ok) {
        throw new Error("Failed to fetch direct messages")
    }
    return response.json()
}

export default fetchDirectMessages