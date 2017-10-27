const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('../db');
const mysql = require('mysql');
const redis = require('redis');
const bluebird = require('bluebird');
let app = express();

//app.use(express.static(path.join(__dirname, '../client/dist/')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/getQueueInitial/:locationId/:userId', (req, res) => {
  console.log('gettingQueueInitial');
  db.getQueueInitial().then((cursor) => {
    res.status(200).send(cursor);
  })
})
app.post('/getQueue/:locationId/:userId', (req, res) => {
  console.log('gettingQueue');
  db.getQueue().then((res) => {
    res.status(200).send(cursor);
  })
});



app.post('/swipe', (req, res) => {

})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => { console.log('Listening on port ' + PORT); } );
