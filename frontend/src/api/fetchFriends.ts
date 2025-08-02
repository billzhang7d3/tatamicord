import { Member } from "../types"

async function fetchFriends(friendType: string): Promise<Member[]> {
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

export default fetchFriends