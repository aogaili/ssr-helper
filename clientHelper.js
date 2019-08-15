import {Meteor} from "meteor/meteor";

export class SSRClientHelper{
    static processData = () => {
        const injectedData = document.getElementById('injected-data');
        if (injectedData) {
            console.log('SSR data detected, processing data..');
            const data = injectedData.innerHTML;
            if (data) {
                const SSRObj = JSON.parse(decodeURIComponent(data));
                if (injectedData.parentNode) {
                    injectedData.parentNode.removeChild(injectedData);
                }
                window.sessionStorage.setItem('SSRData', JSON.stringify(SSRObj));
                return SSRObj;
            }
        }
    }
    static getMap = ()=> {
        const SSRObj = window.sessionStorage.getItem('SSRData');
        if (!SSRObj) {
            return null;
        }
        return JSON.parse(SSRObj);
    }
    static getItem = key => {
        const SSRObj = window.sessionStorage.getItem('SSRData');
        if (!SSRObj) {
            return null;
        }
        const dataObj =  JSON.parse(SSRObj);
        return dataObj[key]
    };
    static getUser = () => {
        return SSRClientHelper.getItem('user')
    }
}
