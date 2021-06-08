const functions = require("firebase-functions");
const admin = require('firebase-admin');

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

exports.getRecipes = functions.https.onRequest((req, res) => {
    admin.firestore().collection('recipes').get()
        .then(data => {
            let recipes = []
            data.forEach(doc => {
                recipes.push(doc.data())
            })
            return res.json(recipes);
        })
        .catch(err => console.error(err))
})