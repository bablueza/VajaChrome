export async function checkKey(key: string): Promise<boolean> {
    const response = await fetch("https://api.aiforthai.in.th/g2p?text=ทดสอบ",{
        method: "GET",
        headers: {
            'content-type': 'application/json',
            "Apikey": key
        }
    });
    return response.ok
}