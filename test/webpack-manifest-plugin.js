import path from 'path';
import fs from 'mz/fs';

import test from 'ava';
import ManifestPlugin from 'webpack-manifest-plugin';

import ModulesCdnWebpackPlugin from '../src';

import runWebpack from './helpers/run-webpack';
import cleanDir from './helpers/clean-dir';

test('webpack-manifest-plugin', async t => {
    await cleanDir(path.resolve(__dirname, './fixtures/output/webpack-manifest-plugin'));

    const stats = await runWebpack({
        context: path.resolve(__dirname, './fixtures/webpack-manifest-plugin'),

        output: {
            publicPath: '',
            path: path.resolve(__dirname, './fixtures/output/webpack-manifest-plugin')
        },

        entry: {
            app: './index.js'
        },

        plugins: [
            new ModulesCdnWebpackPlugin({
                modules: ['react']
            }),
            new ManifestPlugin({
                fileName: 'manifest.json'
            })
        ]
    });

    const manifest = JSON.parse(await fs.readFile(path.resolve(__dirname, './fixtures/output/webpack-manifest-plugin/manifest.json')));

    t.deepEqual(manifest, {
        'app.js': 'app.js',
        'react.js': 'https://unpkg.com/react@15.5.4/dist/react.min.js'
    });

    const externals = stats.compilation.options.externals;
    t.deepEqual(externals, {react: 'React'});

    const output = await fs.readFile(path.resolve(__dirname, './fixtures/output/webpack-manifest-plugin/app.js'));

    // NOTE: not inside t.false to prevent ava to display whole file in console
    const doesIncludeReact = output.includes('PureComponent');
    t.false(doesIncludeReact);
});
