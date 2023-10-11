import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import CryptoES from 'crypto-es';
import got from 'got';

interface EncryptedCookiesData {
    encrypted: string,
}

interface Cookie {
    domain: string,
    expirationDate?: number,
    hostOnly: boolean,
    httpOnly: boolean,
    name: string,
    path: string,
    sameSite: 'no_restriction' | 'lax' | 'strict' | 'unspecified',
    secure: boolean,
    session: boolean,
    storeId: string,
    value: string,
}

interface CookiesData {
    cookie_data: Record<string, Cookie[]>,
    local_storage_data: Record<string, Record<string, string>>,
    update_time: string,
}

const COOKIES = process.env.COOKIES?.trim() ?? '';
const COOKIE_CLOUD_URL = process.env.COOKIE_CLOUD_URL?.trim() ?? '';
const COOKIE_CLOUD_UUID = process.env.COOKIE_CLOUD_UUID?.trim() ?? '';
const COOKIE_CLOUD_KEY = process.env.COOKIE_CLOUD_KEY?.trim() ?? '';

export default async (): Promise<string> => {
    if (COOKIES.length > 0) {
        return COOKIES;
    }
    if (
        COOKIE_CLOUD_URL.length > 0
        && COOKIE_CLOUD_UUID.length > 0
        && COOKIE_CLOUD_KEY.length > 0
    ) {
        const response = await got.get(`${COOKIE_CLOUD_URL}/get/${COOKIE_CLOUD_UUID}`)
            .json<EncryptedCookiesData>();
        if (response.encrypted) {
            const key = CryptoES.MD5(`${COOKIE_CLOUD_UUID}-${COOKIE_CLOUD_KEY}`).toString().substring(0, 16);
            const text = CryptoES.AES.decrypt(response.encrypted, key).toString(CryptoES.enc.Utf8);
            const data = JSON.parse(text) as CookiesData;

            const cookies = data.cookie_data['v2ex.com']
                .filter((cookie) => cookie.domain === 'v2ex.com' || cookie.domain === '.v2ex.com' || cookie.domain === 'www.v2ex.com')
                .map((cookie) => `${cookie.name}=${cookie.value}`).join('; ');

            return cookies;
        }
    }

    const cookiesFile = path.resolve(fileURLToPath(import.meta.url), '..', '..', '.cookies');
    const cookies = fs.readFileSync(cookiesFile, { encoding: 'utf-8' }).trim();

    return cookies;
};
