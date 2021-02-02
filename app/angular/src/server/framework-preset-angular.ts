import path from 'path';
import { ContextReplacementPlugin, Configuration } from 'webpack';
import autoprefixer from 'autoprefixer';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AngularCompilerPlugin } from '@ngtools/webpack';
import getTsLoaderOptions from './ts_config';
import createForkTsCheckerInstance from './create-fork-ts-checker-plugin';

// MEETING

export function webpack(
  config: Configuration,
  { configDir }: { configDir: string }
): Configuration {
  const tsLoaderOptions = getTsLoaderOptions(configDir);

  // console.log(JSON.stringify(config.plugins, null, 4));

  // console.dir(config.plugins, {
  //   depth: Infinity
  // });

  console.dir(config.entry, {
    depth: Infinity,
  });

  return {
    ...config,
    mode: 'development',
    module: {
      ...config.module,
      rules: [
        ...config.module.rules,
        // {
        //   // test: /(?:\.ngfactory\.js|\.ngstyle\.js)$/,
        //   test: /\.tsx?$/,
        //   loader: '@ngtools/webpack',
        // },
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: require.resolve('ts-loader'),
              options: tsLoaderOptions,
            },
            { loader: path.resolve(__dirname, 'ngx-template-loader') },
          ],
        },
        {
          test: /[/\\]@angular[/\\]core[/\\].+\.js$/,
          parser: { system: true },
        },
        {
          test: /\.html$/,
          loader: require.resolve('raw-loader'),
          exclude: /\.async\.html$/,
        },
        {
          test: /\.s(c|a)ss$/,
          use: [
            { loader: require.resolve('raw-loader') },
            {
              loader: require.resolve('postcss-loader'),
              options: {
                postcssOptions: {
                  plugins: [autoprefixer()],
                },
              },
            },
            { loader: require.resolve('sass-loader') },
          ],
        },
      ],
    },
    resolve: {
      ...config.resolve,
      mainFields: [
        'es2015_ivy_ngcc',
        'module_ivy_ngcc',
        'main__ivy_ngcc',
        'es2015',
        'browser',
        'module',
        'main',
      ],
    },
    plugins: [
      ...config.plugins,
      // See https://github.com/angular/angular/issues/11580#issuecomment-401127742
      new ContextReplacementPlugin(
        /@angular(\\|\/)core(\\|\/)(fesm5|bundles)/,
        path.resolve(__dirname, '..')
      ),
      createForkTsCheckerInstance(tsLoaderOptions),
      // new AngularCompilerPlugin({
      //   // tsConfigPath: path.resolve(configDir, '../tsconfig.json'),
      //   tsConfigPath: tsLoaderOptions.configFile,
      //   // entryModule: 'src/app/app.module#AppModule',
      //   directTemplateLoading: true,
      //   skipCodeGeneration: true,
      //   compilerOptions: {
      //     enableIvy: true
      //   }
      // }),
    ],
  };
}
