export async function checkKey(key: string): Promise<boolean> {
    const response = await fetch("https://api.aiforthai.in.th/lextoplus?text=ทดสอบ&norm=\"0\"",{
        method: "GET",
        headers: {
            'content-type': 'application/json',
            "Apikey": key
        }
    });
    return response.ok
}