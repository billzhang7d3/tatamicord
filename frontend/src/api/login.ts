import { Result } from "./types"

interface Credentials {
    email: string
    password: string
}

async function login(credentials: Credentials): Promise<Result> {
    const response = await fetch(import.meta.env.VITE_API_URL!.concat("login/"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
    });
    if (!response.ok) {
        throw new Error("invalid credentials")
    }
    return await response.json()
}

export default login