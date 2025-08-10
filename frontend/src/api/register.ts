async function register(username: string, email: string, password: string): Promise<number> {
    const response = await fetch(import.meta.env.VITE_API_URL!.concat("register/"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            email,
            password
        })
    })
    return response.status
}

export default register