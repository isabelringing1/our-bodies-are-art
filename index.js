const express = require('express');
var path = require("path");

const app = express();

var BoxSDK = require('box-node-sdk');
var folder_id = '123366833733'
var sdk = new BoxSDK({
    clientID: 'p22qhwh72omj1kk8ifbs00tusjkz1il0',
    clientSecret: 'O1aFGAaywW8ShSgGnWCqxFkJLKJpvtP3'
  });
var client = sdk.getBasicClient('WzOybhHQQNkldl9hVrc1kkkngkEvFim9');

app.use(express.static(__dirname + "/"));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/train', (req, res) => {
    res.sendFile(path.join(__dirname, '/train-page.html'));
});

// Start the server
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Senior Project app listening on port ${port}`);
});

client.get('/folders/' + folder_id + '/items', {qs: {fields: 'id,name'}})
	.then(response => { res.send(response)/* ... */ })
	.catch(error => { /* handle any errors */ });

/*
client.folders.getItems(
    folder_id,
    {
        usemarker: 'false',
        fields: 'name',
        offset: 0,
        limit: 100
    })
    .then(items => {
        
        /* items -> {
            total_count: 2,
            entries: 
            [ { type: 'folder',
                id: '11111',
                sequence_id: '1',
                etag: '1',
                name: 'Personal Documents' },
                { type: 'file',
                id: '22222',
                sequence_id: '0',
                etag: '0',
                name: 'Q2 Strategy.pptx' } ],
            offset: 0,
            limit: 25,
            order: 
            [ { by: 'type', direction: 'ASC' },
                { by: 'name', direction: 'ASC' } ] }
        
    });*/