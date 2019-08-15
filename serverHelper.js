import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { check } from "meteor/check";

export class SSRServerHelper{
    constructor(sink){
        this.dataMap = new Map();
        this.sink = sink;
    }

    /**
     * Set a {key,value} pair to be fetched by the client
     * @param key
     * @param value
     */
    setItem = (key, value) => {
        this.dataMap.set(key, value)
    }
    /**
     *
     * @param injectUser - setItem('user', userDoc) to be fetched by client
     * @returns {Promise<null>}
     */
    getUser = async (injectUser = true) => {
        if(!this.sink) {
            console.error("sink object is null");
        }
        else {
            const loginToken = ((this.sink.request || {}).cookies || {}).meteor_login_token;

            if (loginToken) {
                check(loginToken, String);
                const hashedToken = Accounts._hashLoginToken(loginToken);
                const user = await Meteor.users.rawCollection().findOne({
                    'services.resume.loginTokens.hashedToken': hashedToken
                });

                if (user) {
                    // find the right login token corresponding, the current user may have
                    // several sessions logged on different browsers / computers
                    const tokenInformation = user.services.resume.loginTokens.find(
                        tokenInfo => tokenInfo.hashedToken === hashedToken
                    );
                    const expiresAt = Accounts._tokenExpiration(tokenInformation.when);
                    const isExpired = expiresAt < new Date();
                    if(injectUser) {
                        const trimmedUser = user;
                        delete trimmedUser.services;
                        this.setItem('user', trimmedUser);
                    }
                    if (!isExpired) return user;
                }
            }
            return null;
        }
    }
    /**
     * Inject the data in the body of the server rendered page
     */
    injectData = () => {
        const dataMap = this.dataMap;
        if (this.dataMap.size > 0) {
            const SSRObj = {};
            dataMap.forEach((value, key) => {
                SSRObj[key] = value;
            });
            console.info('ssr data found, injecting it...');
            const encodedData = encodeURIComponent(JSON.stringify(SSRObj));
            this.sink.appendToBody(
                `<script type="text/injected-data" id='injected-data'}>${encodedData}</script>`
            );
        } else {
            console.warn('no ssr data available');
        }
    }
}