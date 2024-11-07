/* eslint-disable @typescript-eslint/naming-convention */

interface ChromeVersion {
    channel: string,
    chromium_main_branch_position: number,
    hashes: {
        angle: string,
        chromium: string,
        dawn: string,
        devtools: string,
        pdfium: string,
        skia: string,
        v8: string,
        webrtc: string,
    },
    milestone: number,
    platform: string,
    previous_version: string,
    time: number,
    version: string,
}

const res = await fetch('https://chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Mac&num=1&offset=0');
const data = await res.json() as ChromeVersion[];
const major = data[0].milestone;

export default `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${major.toString()}.0.0.0 Safari/537.36`;
