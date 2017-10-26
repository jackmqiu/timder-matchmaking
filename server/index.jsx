const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('../db/index');
const mysql = require('mysql');
const redis = require('redis');

let app = express();

//app.use(express.static(path.join(__dirname, '../client/dist/')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/getQueue', (req, res) => {
  
})

app.post('/swipe', (req, res) => {

})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => { console.log('Listening on port ' + PORT); } );
