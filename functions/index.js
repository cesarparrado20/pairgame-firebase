const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.example = functions.https.onRequest((req, res) => {  
    const profilesRef = admin.database().ref('/example');
    const response = profilesRef.set({
        1: {
            avatar: 1,
            points: 0
        }
    });
    res.send('OK!')
});

exports.createProfile = functions.auth.user().onCreate((user) => {
    const profilesRef = admin.database().ref('/profiles');
    profilesRef.set({
        [user.uid]: {
            avatar: 1,
            points: 0
        }
    });
});

exports.deleteProfile = functions.auth.user().onDelete((user) => {
    const profileToDelete = admin.database().ref(`/profiles/${user.uid}`);
    profileToDelete.remove();
});

exports.scorePoints = functions.database.ref('/records/{pushId}').onCreate((snapshot, context) => {
    let currentPoints = 0;
    let newPoints = 0;
    const uidUser = snapshot.child('user').val();
    const completed = snapshot.child('completed').val();
    const profileRef = admin.database().ref(`/profiles/${uidUser}`);
    profileRef.on('value', function(snapshot) {
        currentPoints = snapshot.child('points').val();
    });
    if (completed) {
        newPoints = currentPoints + 3;
    } else {
        newPoints = currentPoints - 1;
    }
    if (newPoints < 0) {
        newPoints = 0;
    }
    profileRef.update({
        'points': newPoints
    });
});

exports.addLevel = functions.database.ref('/images/{pushId}').onCreate((snapshot, context) => {
    let currentLevel = 0;
    let totalImages = 0;
    if((totalImages % 3) === 0){
        currentLevel = totalImages / 3;
        snapshot.ref.parent.orderByChild('level').equalTo(0).update({
            'level': currentLevel
        });
    }
});
