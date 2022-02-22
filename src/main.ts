import got from 'got';

import logger from './logger.js';

const UserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36';

export default async (cookies: string): Promise<[boolean, string][]> => {
    const reportLog: [boolean, string][] = [];

    let response = await got.get('https://www.v2ex.com/', {
        headers: {
            'User-Agent': UserAgent,
            'Cookie': cookies,
        },
    });

    if (response.body.includes('/signin')) {
        logger.error('登录状态已失效');
        reportLog.push([false, '登录状态已失效']);
        throw reportLog;
    }

    response = await got.get('https://www.v2ex.com/mission/daily', {
        headers: {
            'User-Agent': UserAgent,
            'Cookie': cookies,
            'Referer': 'https://www.v2ex.com/',
        },
    });

    if (response.body.includes('每日登录奖励已领取')) {
        logger.info('每日登录奖励已领取');
        reportLog.push([true, '每日登录奖励已领取']);
        return reportLog;
    }

    const result = response.body.match(/redeem\?once=([^']*)'/);
    if (result === null) {
        logger.error('无法获取once参数');
        reportLog.push([false, '无法获取once参数']);
        throw reportLog;
    }

    const once = result[1];

    await got.get('https://www.v2ex.com/mission/daily/redeem', {
        headers: {
            'User-Agent': UserAgent,
            'Cookie': cookies,
            'Referer': 'https://www.v2ex.com/mission/daily',
        },
        searchParams: {
            once,
        },
    });

    response = await got.get('https://www.v2ex.com/mission/daily', {
        headers: {
            'User-Agent': UserAgent,
            'Cookie': cookies,
            'Referer': 'https://www.v2ex.com/',
        },
    });

    if (!response.body.includes('每日登录奖励已领取')) {
        logger.error('每日登录奖励领取失败');
        reportLog.push([false, '每日登录奖励领取失败']);
        return reportLog;
    }

    logger.info('每日登录奖励领取成功');
    reportLog.push([true, '每日登录奖励领取成功']);

    return reportLog;
};
