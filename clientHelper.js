export class SSRClientHelper{
    /**
     * Process the data injected by the SSRServerHelper
     * @returns {any}
     */
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
    /**
     *  Get an object of all the SSRed data
     * @returns {*}
     */
    static getMap = ()=> {
        const SSRObj = window.sessionStorage.getItem('SSRData');
        if (!SSRObj) {
            return null;
        }
        return JSON.parse(SSRObj);
    }

    /**
     * Get an SSRed data item with a given key
     * @param key
     * @returns {object}
     */
    static getItem = key => {
        const SSRObj = window.sessionStorage.getItem('SSRData');
        if (!SSRObj) {
            return null;
        }
        const dataObj =  JSON.parse(SSRObj);
        return dataObj[key]
    };
    /**
     *  Get the user passed by the server during SSR
      * @returns {Object}
     */
    static getUser = () => {
        return SSRClientHelper.getItem('user')
    }
}
