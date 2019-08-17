Package.describe({
  name: "alawi:ssr-helper",
  version: "0.0.4",
  summary: "Meteor Server Render Helper Functions",
  git: "https://github.com/aliogaili/ssr-helper",
  documentation: "README.md"
});

Package.onUse(function(api) {
  api.versionsFrom("1.8.1");

  Npm.depends({
    "cookie-parser": "1.4.4"
  });

  api.use("ecmascript");
  api.use("server-render");
  api.use("chuangbo:cookie@1.1.0");
  api.use("accounts-base");
  api.use("check");

  api.addFiles(["auth.js"], "client");

  api.mainModule("clientHelper.js", "client");
  api.mainModule("serverHelper.js", "server");
});
