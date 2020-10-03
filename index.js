const express = require('express');
var path = require("path");

const app = express();

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
