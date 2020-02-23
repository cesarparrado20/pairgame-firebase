const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.createProfile = functions.auth.user().onCreate((user) => {
    const profilesRef = admin.database().ref('/profiles');
    profilesRef.child(user.uid).set({
        points: 0,
        worldSurpassed: []
    });
});

exports.deleteProfile = functions.auth.user().onDelete((user) => {
    const profileToDelete = admin.database().ref(`/profiles/${user.uid}`);
    profileToDelete.remove();
});

exports.scorePoints = functions.database.ref('/records/{pushId}').onCreate((snapshot, context) => {
    let currentPoints = 0;
    let worldSurpassed = [];
    let newPoints = 0;
    const uidUser = snapshot.child('user').val();
    const completed = snapshot.child('completed').val();
    const profileRef = admin.database().ref(`/profiles/${uidUser}`);
    profileRef.on('value', function(snapshot) {
        currentPoints = snapshot.child('points').val();
        const auxWS = snapshot.child('worldSurpassed').val();
        if(auxWS){
            worldSurpassed = auxWS;
        }
    });
    if (completed) {
        newPoints = currentPoints + 3;
        worldSurpassed.push(snapshot.child('level').val());
    } else {
        newPoints = currentPoints - 1;
    }
    if (newPoints < 0) {
        newPoints = 0;
    }
    profileRef.update({
        'points': newPoints,
        worldSurpassed
    });
});