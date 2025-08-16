import { Message } from "../types";

async function fetchChannelMessages(id: string): Promise<Message[]> {
    const response = await fetch(import.meta.env.VITE_API_URL!.concat(`messages/${id}/`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `jwt ${localStorage.getItem("authToken")}`
      }
    })
    if (!response.ok) {
        throw new Error(response.status.toString())
    }
    return response.json()
}

export default fetchChannelMessages
