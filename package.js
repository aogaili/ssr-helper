Package.describe({
  name: 'ssr-helper',
  version: '0.0.1',
  summary: 'Meteor Server Render Helper Functions',
  git: 'https://github.com/aliogaili/ssr-helper',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.8.1');

  api.use('ecmascript');
  api.use('server-render');
  api.use('chuangbo:cookie');
  api.use('accounts-base');
  api.use('check');

  api.addFiles([
      'auth.js'
  ], 'client');

  api.mainModule('clientHelper.js', 'client');
  api.mainModule('serverHelper.js', 'server');
});
