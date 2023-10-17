import got from 'got';

import logger from './logger.ts';

const UserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36';

export default async (cookies: string) => {
    const indexPage = await got.get('https://www.v2ex.com/', {
        headers: {
            'User-Agent': UserAgent,
            Cookie: cookies,
        },
    });

    if (indexPage.body.includes('/signin')) {
        logger.error('登录状态已失效');
        return;
    }

    const mission = await got.get('https://www.v2ex.com/mission/daily', {
        headers: {
            'User-Agent': UserAgent,
            Cookie: cookies,
            Referer: 'https://www.v2ex.com/',
        },
    });

    if (mission.body.includes('每日登录奖励已领取')) {
        logger.info('每日登录奖励已领取');
        return;
    }

    const [, once] = mission.body.match(/redeem\?once=([^']*)'/) ?? [] as (string | undefined)[];
    if (once === undefined) {
        logger.error('无法获取once参数');
        return;
    }

    await got.get('https://www.v2ex.com/mission/daily/redeem', {
        headers: {
            'User-Agent': UserAgent,
            Cookie: cookies,
            Referer: 'https://www.v2ex.com/mission/daily',
        },
        searchParams: {
            once,
        },
    });

    const final = await got.get('https://www.v2ex.com/mission/daily', {
        headers: {
            'User-Agent': UserAgent,
            Cookie: cookies,
            Referer: 'https://www.v2ex.com/',
        },
    });

    if (!final.body.includes('每日登录奖励已领取')) {
        logger.error('每日登录奖励领取失败');
    } else {
        logger.info('每日登录奖励领取成功');
    }
};
