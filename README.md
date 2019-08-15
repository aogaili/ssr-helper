## About

This is a class of simple helper functions for simplifying Meteor's server rendering process. 

Specifically, it aims to abstract and simplify:
1. The Retrieval of the the user document for a logged user (if available)
2. The injection of data to be using in the client hydration 


## Usage

**Server:**


```
import {SSRServerHelper} from 'meteor/alawi:ssr-helper';

.....

onPageLoad(async sink => {
    // Instantiate the server helper.
    const ssrHelper = new SSRServerHelper(sink);
    // Get the user doc (if logged in) using a cookie.
    const user = await ssrHelper.getUser();
    // Set items to be passed to the client.
    ssrHelper.setItem('count', {name: '1'});
    // Inject the data in the page body.
    ssrHelper.injectData();
    
    sink.renderIntoElementById("app", renderToString(
        <Hello user={user}/>
    ));
});
```

**Client:**

Somewhere in the client initialize code:

```
import {SSRClientHelper} from 'meteor/alawi:ssr-helper';

// Process the injected SSR data
SSRClientHelper.processData();

// Use the data to hydrate components
// Render pages etc.
console.log(SSRClientHelper.getItem('name'));
console.log(SSRClientHelper.getItem('user'));
console.log(SSRClientHelper.getMap());
```

## How
A cookie is set when the user is logged-in to keep track of their state. The cookie 
them gets passed to the server on the http initial request which is then used to fetch the user doc 
from the users collection.

The data is then injected in the body of the server rendered page. The client parses the injected
data and store in the session storage. 

## Credits

The code is based on the snippets from [kadira's fast render package](https://github.com/kadirahq/fast-render). 