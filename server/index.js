const express = require('express');
const bodyParser = require('body-parser');
const db = require('../db');
const redis = require('redis');

let app = express();

//app.use(express.static(path.join(__dirname, '../client/dist/')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/getQueue/:locationId/:userId', (req, res) => {
  console.log('gettingQueueInitial', req.params);
  db.fillAndRetrieveQueueList(req.params.locationId, req.params.userId)
  .then((cursor) => {
    db.deleteQueueList(req.params.userId);
    console.log('promise of app.get', cursor);
    res.status(200).send(cursor);
  })
  .catch((err) => {
    console.log(err);
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
