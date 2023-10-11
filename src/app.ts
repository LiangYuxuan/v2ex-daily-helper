import 'dotenv/config';
import cron from 'node-cron';

import logger from './logger.js';
import getCookies from './cookies.js';
import main from './main.js';
import pushToPushDeer from './push.js';

const pushKey = process.env.PUSHKEY ?? '';
const cronExp = process.env.CRON_EXP ?? '';

const mainHandler = async () => {
    let reportLog: [boolean, string][];
    try {
        const cookies = await getCookies();
        reportLog = await main(cookies);
    } catch (error) {
        logger.error(error);
        reportLog = [
            [false, (error as Error).message],
        ];
    }

    if (pushKey.length > 0) {
        const status = reportLog.every((value) => value[0]);
        const reportText = reportLog.map((value) => `${value[0] ? '✅' : '❌'}${value[1]}`).join('\n\n');
        await pushToPushDeer(pushKey, `# ${status ? '✅V2EX每日签到成功' : '❌V2EX每日签到失败'}`, reportText);
    } else {
        logger.warn('未设定PushKey');
    }
};

if (cronExp.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    cron.schedule(cronExp, mainHandler, {
        timezone: 'Asia/Shanghai',
    });
} else {
    logger.warn('未设定定时执行表达式');
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
mainHandler();
