const express = require('express');
const app = express();
const searchBook = require('./src/searchopac');

app.get('/api/OCA/SearchByTitle', (req, res) => {
    const{serverId, title, index} = req.query;
    const count = 20;
    const server1={Url: '140.147.249.38', Port: '7090', Database: 'voyager', Syntax: 'USMARC'};
    const server2={Url: '174.36.57.36', Port: '210', Database: 'oca-americana', Syntax: 'MARC21'};
    const queryText = `@attr 1=4 @attr 4=6 "${title}"`;
    console.log(`Search on server2 --> ${queryText} FROM INDEX ${index}`)
    searchBook(server2, queryText, index, count)
    .then(result => res.json(result))
    .catch(err => res.send(err));
});


app.listen(3000, () => console.log('server started'));