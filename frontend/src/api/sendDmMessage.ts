import { Message } from "../types"

async function sendDmMessage(id: string, message: string): Promise<Message> {
    const response = await fetch(import.meta.env.VITE_API_URL!.concat(`direct-message/${id}/`), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `jwt ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({
            content: message
        })
    })
    if (!response.ok) {
        throw new Error("Failed to send message")
    }
    return response.json()
}

export default sendDmMessage
