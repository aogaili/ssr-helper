## About

This pacakge aims to simplify Meteor's servering rendering process. Specifically:

1. Make Meteor.User() works during server rendering.

Accessing ```Meteor.user()``` during Meteor server rendering process will result in
```Meteor.userId can only be invoked in method calls or publications```
this is because the Meteor DDP session has not been instaniated yet. However, it is a common to require the user object in order to personalize the server render page thus the package will patch ```Meteor.user()``` to make it work during SSR.

2. The package also aims to simplify the marshaling of data from server to client during SSR.


## Usage

Install with:

```
$ meteor add alawi:ssr-helper
```

**Server:**


```
import { SSRServerHelper } from 'meteor/alawi:ssr-helper';

.....

onPageLoad(async sink => {
    // Meteor.user() will work as expected, instead of throwing out of context 
    // error
    console.log(Meteor.user())
    // Instantiate the server helper.
    const ssrHelper = new SSRServerHelper(sink);
    // Get the user doc (if logged in) using a cookie.
    const user = await ssrHelper.getUser();
    // Set items to be passed to the client.
    ssrHelper.setItem('count', {name: '1'});
    // Inject the data in the page body.
    // This will also inject user doc by default.
    ssrHelper.injectData();
    
    sink.renderIntoElementById("app", renderToString(
        <Hello user={user}/>
    ));
});
```

**Client:**

Somewhere in the client initialization code:

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

## Security

Using the user token to fetch the user data when doing SSR has some security concerns that were discussed [here](https://github.com/kadirahq/fast-render/issues/145), and [here](https://blog.meteor.com/why-meteor-doesnt-use-session-cookies-e988544f52c9).

## Next Steps
- Patch ```Meteor.userId``` on the server during SSR
- Patch ```Meteor.user()``` at the client during SSR

## Credits
The code is based on the snippets from [kadira's fast render package](https://github.com/kadirahq/fast-render). 
