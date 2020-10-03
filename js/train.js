var BoxSDK = require('box-node-sdk');
 
// Initialize the SDK with your app credentials
var sdk = new BoxSDK({
  clientID: 'p22qhwh72omj1kk8ifbs00tusjkz1il0',
  clientSecret: 'O1aFGAaywW8ShSgGnWCqxFkJLKJpvtP3'
});
 
// Create a basic API client, which does not automatically refresh the access token
var client = sdk.getBasicClient('WzOybhHQQNkldl9hVrc1kkkngkEvFim9');
 
// Get your own user object from the Box API
// All client methods return a promise that resolves to the results of the API call,
// or rejects when an error occurs
client.users.get(client.CURRENT_USER_ID)
    .then(user => console.log('Hello', user.name, '!'))
    .catch(err => console.log('Got an error!', err));

    
var http = require('http');
const port = process.env.PORT || 3500;
http.createServer(function (req, res) {
    console.log(`Example app listening on port ${port}`);
}).listen(port);