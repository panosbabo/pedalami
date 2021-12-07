var express = require('express');
var app = express.Router();
app.use(express.json());
const User = require('../schemas.js').User;

app.post('/initUser', (req, res) => {
  console.log('Received initUser POST request:');
  console.log(req.body);
  if (req.body.userId) {
    User.findOne({userId: req.body.userId}, function(err, user) {
      if (err) {
        console.log('Error checking the User existence.');
        res.status(500).send('Error finding the user.');
      }
      if (user) {
        console.log('The user already exist. Returning it');
        //TODO fai la join con i team e ritornali
        res.status(200).send(user);
      } else { // user doesn't exist
        const newUser = new User({ userId: req.body.userId });
        newUser.save( (error) => {
          if (error) {
            console.log('Error saving the user.');
            res.status(500).send('Error saving the user!');
          } else {
            console.log('The user has been saved.');
            res.status(200).send(newUser);
          }
        });
      }
    });
  }
});

// GET /getTeams?userId=userId
app.get('/getTeams', (req, res) => {
  const userId = req.query.userId;
  console.log('Received getTeams GET request with param id=' + userId);
  if (userId) {
    User
      .aggregate([
        {
          $match: {
            uid: userId
          }
        },
        {
          $lookup: {
            from: "teams", // collection name in db
            localField: "teams", // field of User to make the lookup on (the foreign key)
            foreignField: "_id", // the referred field in teams
            as: "teams" // name that the field of the join will have in the result/JSON
          }
        }
      ])
      .exec((error, user) => {
        if (error) {
          console.log('Error finding the user.\n' + error);
          res.status(500).send('Error finding the user!');
        } else {
          res.status(200).send(user);
        }
      });
  } else {
    console.log('Error: Missing parameters.');
    res.status(400).send('Error: Missing parameters.');
  }
});

// USELESS
// GET /getStatistics?userId=userId
app.get('/getStatistics', (req, res) => {
  console.log('Received search GET request with param userId='+req.query.userId);
  if (req.query.userId) {
    User.findOne({ userId: req.query.userId }, (user, error) => {
      if (error) {
        console.log('Error finding the specified user.\n'+error);
        res.status(500).send('Error finding the specified user!');
      } else {
        res.status(200).send(user);
      }
    });
  } else {
    console.log('Error: Missing parameters.');
    res.status(400).send('Error: Missing parameters.');
  }
});

function updateUserStatistics(user, ride) {
  user.statistics.numberOfRides++;
  user.statistics.totalDuration += ride.durationInSeconds;
  user.statistics.totalKm += ride.totalKm;
  user.statistics.totalElevationGain += ride.elevationGain;
  user.statistics.averageSpeed = user.statistics.totalKm / user.statistics.totalDuration;
  user.statistics.averageKm = user.statistics.totalKm / user.statistics.numberOfRides;
  user.statistics.averageDuration = user.statistics.totalDuration / user.statistics.numberOfRides;
  user.statistics.averageElevationGain = user.statistics.totalElevationGain / user.statistics.numberOfRides;
}

module.exports = {
  router: app,
  updateUserStatistics: updateUserStatistics
}