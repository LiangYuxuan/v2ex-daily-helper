import { core, node, browser } from '@rhyster/eslint-config';

export default [
    ...node.map((config) => ({
        ...config,
        files: ['src/**/*.ts'],
    })),
];
