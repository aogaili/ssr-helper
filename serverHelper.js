import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";
import { Accounts } from "meteor/accounts-base";
import { check } from "meteor/check";
import cookieParser from "cookie-parser";

// This method will be patch Meteor.user() to return
// the user with login token inferred using the cookie
// in the request. The patch only happens on http request
// and when invoked outside methods or publications.
WebApp.connectHandlers.use(cookieParser()).use(function(req, res, next) {
  const currentInvocation =
    DDP._CurrentMethodInvocation.get() ||
    DDP._CurrentPublicationInvocation.get();
  // If it is the server and we're outside the a method or publication
  // then patch the Account.user() method to use the user from cookie.
  if (Meteor.isServer && !currentInvocation) {
    const promise = new Promise(async resolve => {
      // Use the cookie if found to fetch the user
      const ssrHelper = new SSRServerHelper({ request: req });
      const user = await ssrHelper.getUser();
      resolve(user);
    });
    promise.then(user => {
      // Patch meteor user method to return the
      // SSRed user.
      Meteor.user = () => {
        // Add a flag to indicate that this is an
        // SSRed user as oppose to a DDP connection user.
        if (user) {
          user.ssrUser = true;
        }
        return user;
      };
      next();
    });
  }
});

export class SSRServerHelper {
  constructor(sink) {
    this.dataMap = new Map();
    this.sink = sink;
  }

  /**
   * Set a {key,value} pair to be fetched by the client
   * @param key
   * @param value
   */
  setItem = (key, value) => {
    this.dataMap.set(key, value);
  };
  /**
   *
   * @param injectUser - setItem('user', userDoc) to be fetched by client
   * @returns {Promise<null>}
   */
  getUser = async () => {
    if (!this.sink) {
      console.error("sink object is null");
    } else {
      const loginToken = ((this.sink.request || {}).cookies || {})
        .meteor_login_token;
      if (loginToken) {
        check(loginToken, String);
        const hashedToken = Accounts._hashLoginToken(loginToken);
        const user = await Meteor.users.rawCollection().findOne({
          "services.resume.loginTokens.hashedToken": hashedToken
        });

        if (user) {
          // find the right login token corresponding, the current user may have
          // several sessions logged on different browsers / computers
          const tokenInformation = user.services.resume.loginTokens.find(
            tokenInfo => tokenInfo.hashedToken === hashedToken
          );
          const expiresAt = Accounts._tokenExpiration(tokenInformation.when);
          const isExpired = expiresAt < new Date();
          if (!isExpired) return user;
        }
      }
      return null;
    }
  };
  /**
   * Inject the data in the body of the server rendered page,
   * @param injectUser - inject SSRed user, default true.
   */
  injectData = (injectUser = true) => {
    const dataMap = this.dataMap;
    // Inject the user object
    if (injectUser && !dataMap["user"]) {
      const user = Meteor.user();
      // Remove user services for security and performance
      if (user) {
        delete user.services;
      }
      dataMap.set("user", user);
    }
    const SSRObj = {};
    dataMap.forEach((value, key) => {
      SSRObj[key] = value;
    });
    console.info("SSRServerHelper - injecting SSR data:");
    console.info(SSRObj);
    const encodedData = encodeURIComponent(JSON.stringify(SSRObj));
    this.sink.appendToBody(
      `<script type="text/injected-data" id='injected-data'}>${encodedData}</script>`
    );
  };
}
