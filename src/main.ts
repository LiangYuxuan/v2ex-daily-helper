import logger from './logger.ts';
import userAgent from './userAgent.ts';

export default async (cookies: string) => {
    const headers = new Headers();
    headers.set('User-Agent', userAgent);
    headers.set('Cookie', cookies);

    const indexPage = await (await fetch('https://www.v2ex.com/', { headers })).text();

    if (indexPage.includes('/signin')) {
        logger.error('登录状态已失效');
        return;
    }

    const mission = await (await fetch('https://www.v2ex.com/mission/daily', { headers })).text();

    if (mission.includes('每日登录奖励已领取')) {
        logger.info('每日登录奖励已领取');
        return;
    }

    const [, once] = /redeem\?once=([^']*)'/.exec(mission) ?? [] as (string | undefined)[];
    if (once === undefined) {
        logger.error('无法获取once参数');
        return;
    }

    await fetch(`https://www.v2ex.com/mission/daily/redeem?once=${once}`, { headers });

    const final = await (await fetch('https://www.v2ex.com/mission/daily', { headers })).text();

    if (!final.includes('每日登录奖励已领取')) {
        logger.error('每日登录奖励领取失败');
    } else {
        logger.info('每日登录奖励领取成功');
    }
};
