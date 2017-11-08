
let generatePreference = () => {

  return Math.floor(Math.random() * 100) / 100;
}

// Instead of generating batch numbers, just randomly pick a fraction of 10 mil users to log on at a time.
// See startUserSessions.js

// let generateLoginBatch = (timeBlocks) => {
//   let randomNum = Math.random() * 100;
//   if (randomNum > 75) {
//     return 9;
//   } else if (randomNum > 55) {
//     return 8;
//   } else if (randomNum > 40) {
//     return 7;
//   } else if (randomNum > 30) {
//     return 6;
//   } else if (randomNum > 20) {
//     return 5;
//   } else if (randomNum > 15) {
//     return 4;
//   } else if (randomNum > 10) {
//     return 3;
//   } else if (randomNum > 6) {
//     return 2;
//   } else if (randomNum > 3) {
//     return 1;
//   } else {
//     return 0;
//   }
// }

let generatePhotoCount = () => {
  return Math.floor(Math.random() * 5) + 1;
}

let generateGender = () => {
  if (Math.random() > .5) {
    return 'm';
  } else {
    return 'f';
  }
}

let generateLocation = () => {
  let randomNum = Math.random() * 100;
   if (randomNum > 80) {
     return 'A';
   } else if (randomNum > 60) {
     return 'B';
   } else if (randomNum > 40) {
     return 'C';
   } else if (randomNum > 20) {
     return 'D';
   } else {
     return 'E';
   }
}

let generateNewUserArray = (userId) => {
  let newUser = [];
  newUser.push('userId');
  newUser.push(userId);
  newUser.push('location');
  newUser.push(generateLocation());
  newUser.push('photoCount');
  newUser.push(generatePhotoCount());
  newUser.push('gender');
  newUser.push(generateGender());
  newUser.push('preferenceFor0Photos');
  newUser.push(generatePreference());
  newUser.push('preferenceFor1Photos');
  newUser.push(generatePreference());
  newUser.push('preferenceFor2Photos');
  newUser.push(generatePreference());
  newUser.push('preferenceFor3Photos');
  newUser.push(generatePreference());
  newUser.push('preferenceFor4Photos');
  newUser.push(generatePreference());
  // newUser.push('loginBatch');
  // newUser.push(generateLoginBatch());


  return newUser;
}

module.exports = {
  generateNewUserArray,
  generateLocation
}
