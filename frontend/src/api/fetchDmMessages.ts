import { Message } from "../types";

async function fetchDmMessages(id: string): Promise<Message[]> {
    const response = await fetch(import.meta.env.VITE_API_URL!.concat(`direct-message/${id}/`), {
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

export default fetchDmMessages