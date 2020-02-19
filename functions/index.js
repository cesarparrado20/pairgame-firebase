const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.listImages = functions.https.onRequest((req, res) => {
    let retorno = [];  
    const imagesRef = admin.database().ref('/images');
    imagesRef.on('value', function(snapshot){
        retorno = snapshot.val();
    });
    res.send(retorno)
});

exports.scraping = functions.https.onRequest((req, res) => {
    const imagesRef = admin.database().ref('/images');
    var totalImages = 0;
    imagesRef.on('value', function(snapshot){
        totalImages = snapshot.numChildren();
    });
    imagesRef.push({
        name: 'Example',
        url: 'xxx',
        conditional: false,
        total: (totalImages + 1)
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
    var levelCase = 1;
    const totalImages = snapshot.child('total').val();
    if(totalImages > 0){
        switch((totalImages % 3)){
            case 0:
                levelCase = (totalImages / 3)
                break;
            case 1:
                levelCase = ((totalImages + 2)/3)
                break;
            case 2:
                levelCase = ((totalImages + 1)/3)
                break;
        }
    }
    snapshot.ref.child('level').set(levelCase)
});