function bufToBase64(buf) {
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function base64ToBuf(b64) {
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

async function getKeyFromPassword(password, salt) {
    const pwUtf8 = new TextEncoder().encode(password);
    const baseKey = await crypto.subtle.importKey('raw', pwUtf8, 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 600000, hash: 'SHA-256' }, baseKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function encryptMessage(password, plainText) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await getKeyFromPassword(password, salt);
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plainText));
    return { salt: bufToBase64(salt), iv: bufToBase64(iv), ct: bufToBase64(ct) };
}

export async function decryptMessage(password, data) {
    const salt = base64ToBuf(data.salt);
    const iv = base64ToBuf(data.iv);
    const ct = base64ToBuf(data.ct);
    const key = await getKeyFromPassword(password, salt);
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    return new TextDecoder().decode(plainBuf);
}

// Sahte parola hash fonksiyonu
async function hashPassword(password, salt) {
    const pwUtf8 = new TextEncoder().encode(password);
    const baseKey = await crypto.subtle.importKey('raw', pwUtf8, 'PBKDF2', false, ['deriveBits']);
    const hashBits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 600000, hash: 'SHA-256' }, baseKey, 256);
    return bufToBase64(new Uint8Array(hashBits));
}

// Sahte parola hash oluşturma ve saklama
export async function createHoneyPasswordHash(password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hash = await hashPassword(password, salt);
    return { salt: bufToBase64(salt), hash: hash };
}

// Sahte parola doğrulama
export async function verifyHoneyPassword(password, storedData) {
    const salt = base64ToBuf(storedData.salt);
    const hash = await hashPassword(password, salt);
    return hash === storedData.hash;
}