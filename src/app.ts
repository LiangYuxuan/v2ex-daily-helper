/* eslint-disable import-x/no-unused-modules */

import 'dotenv/config';
import cron from 'node-cron';

import getCookies from './cookies.ts';
import logger from './logger.ts';
import main from './main.ts';
import pushToPushDeer from './push.ts';

const pushKey = process.env.PUSHKEY ?? '';
const cronExp = process.env.CRON_EXP ?? '';

const coreHandler = async () => {
    await main(await getCookies('v2ex.com'));
};

const mainHandler = () => {
    coreHandler()
        .catch((error: unknown) => {
            logger.error((error as Error).message);
            console.error(error);
        })
        .finally(() => {
            if (pushKey.length > 0) {
                const { isAllSuccess, pushText } = logger.getPushInfo();
                pushToPushDeer(pushKey, `# ${isAllSuccess ? '✅V2EX每日签到成功' : '❌V2EX每日签到失败'}`, pushText.join('\n\n'))
                    .then(() => {
                        logger.clearPushInfo();
                    })
                    .catch((error: unknown) => {
                        console.error((error as Error).message);
                        console.error(error);
                    });
            } else {
                console.warn('未设定PushKey');
            }
        });
};

if (cronExp.length > 0) {
    cron.schedule(cronExp, mainHandler, {
        timezone: 'Asia/Shanghai',
    });
} else {
    console.warn('未设定定时执行表达式');
}

mainHandler();
