import config from '$lib/configs/api.json';
export async function vaja_synth(inputText: string): Promise<string> {
    const response = await fetch(config.vaja_url,{
        method: "POST",
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            "text": inputText,
            "file_type": "wav",
            "speaker_name": "noon"
        })
    });
    if (response.ok) {
        const res_json = await response.json();
        return res_json.audio_url;
    } else {
        return 'Something went wrong!';
    }
}
export async function checkUrlReachable(url: string): Promise<boolean> {
    try {
        const res = await fetch(url, { method: 'HEAD' });
        return res.ok; // true ถ้า HTTP status 200-299
    } catch (e) {
        return false;
    }
}
export function isValidUrl(url: string): boolean {
  try {
    new URL(url); // ถ้าไม่ใช่ URL ที่ valid จะ throw
    return true;
  } catch (_) {
    return false;
  }
}