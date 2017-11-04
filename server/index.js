const express = require('express');
const bodyParser = require('body-parser');
const db = require('../db');
const redis = require('redis');

let app = express();

//app.use(express.static(path.join(__dirname, '../client/dist/')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/getMatchQueue/:userId', (req, res) => {
  db.retrieveMatchList(req.params.userId)
  .then((matchList) => {
    console.log('potential matchQueue of app.get', matchList);
    db.deleteMatchQueue(req.params.userId);
    res.status(200).send(matchList);
  })
});

app.get('/getQueue/:locationId/:userId', (req, res) => {
  console.log('gettingQueueInitial', req.params);
  db.fillAndRetrieveQueueList(req.params.locationId, req.params.userId)
  .then((cursor) => {
    db.deleteQueueList(req.params.userId);
    console.log('queue of app.get', cursor);
    res.status(200).send(cursor);
  })
  .catch((err) => {
    console.log('err at getQueue server', err);
  })
});

app.get('/getDatabaseInfo', (req, res) => {
  db.getDatabaseInfo()
  .then((info) => {
    console.log('databaseInfo', info);
  })
})
app.get('/getUser/:userString', (req, res) => {
  console.log('getting User', req.params.userString);
  db.getUserProfile(req.params.userString)
  .then((userProfile) => {
    console.log('SERVER/INDEX.JS, GETUSERPROFILE.THEN userProfile', userProfile);
    res.status(200).send(userProfile);
  })
});

app.post('/swipe/:userId/:userId2/:direction/:match', (req, res) => {
  console.log('swipePosting received at server', req.params);
  db.postSwipes(req.params.userId, req.params.userId2, req.params.direction, req.params.match)
  .then((cursor) => {
    res.status(200).send('successful');
  })
  .catch((err) => {
    console.log('err at swipe server', err);
  })
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => { console.log('Listening on port ' + PORT); } );
