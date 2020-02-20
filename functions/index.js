const request = require('request-promise');
const cheerio = require('cheerio');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

function getLevel(ref, total){
    var levelCase = 1;
    switch((total % 3)){
        case 0:
            levelCase = (total / 3)
            ref.orderByChild('level').equalTo(levelCase).on('value', function(snapshot){
                snapshot.forEach(function(childSnapshot){
                    childSnapshot.ref.update({
                        available: true
                    })
                });
            });
            break;
        case 1:
            levelCase = ((total + 2)/3)
            break;
        case 2:
            levelCase = ((total + 1)/3)
            break;
    }
    return levelCase;
}

function addImage(pub, imagesRef, count){
    let exists = false;
    const id = pub.find('.news-description .news-id').text()
    imagesRef.child(id).on('value', function(snapshot) {
        exists = snapshot.exists()
    });
    if(!exists){
        const title = pub.find('.news-description .news-title').text()
        const url = pub.find('.news-image img').attr('src')
        const level = getLevel(imagesRef, count)
        const description = pub.find('.news-description .news-teaser').text().split('.')[0]
        imagesRef.child(id).set({
            title,
            level,
            description,
            url,
            available: false
        });
    }
    return exists;
}

/* exports.listImages = functions.https.onRequest(async (req, res) => {
    let retorno = [];  
    const imagesRef = admin.database().ref('/images');
    imagesRef.on('value', function(snapshot){
        retorno = snapshot.val();
    });
    res.send(retorno)
}); */

exports.scraping = functions.https.onRequest(async (req, res) => {
    const pageEnd = req.query.page ? req.query.page : 1;
    const urlScraping = req.query.url ? req.query.url : 'https://www.eso.org/public/images/potw/archive/year/2020';
    var totalImages = 0;
    const imagesRef = admin.database().ref('/images');
    imagesRef.on('value', function(snapshot){
        totalImages = snapshot.numChildren();
    });
    var count = totalImages + 1;
    for(var x=0; x < pageEnd; x++){
        const $ = await request({
            uri: `${urlScraping}/list/${(x+1)}/`,
            transform: body => cheerio.load(body)
        });
        $('.news-wrapper').each((i, el) => {
            const pub = $(el);
            const addConfirmation = addImage(pub, imagesRef, count);
            if(addConfirmation){
                count++;
            }
        });
    }
    res.send('Scraping exitoso!')
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