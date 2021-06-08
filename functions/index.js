const functions = require("firebase-functions");
const admin = require('firebase-admin');

admin.initializeApp();

const express = require('express');
const app = express();

app.get('/recipes', (req, res) => {
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

exports.createRecipe = functions.https.onRequest((req, res) => {
    if(req.method !== 'POST') {
        return res.status(400).json({ error: 'Method not allowed'} );
    }
    const newRecipe = {
        title: req.body.title,
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date ()),
        ingredients: req.body.ingredients,
        keywords: req.body.keywords
    }

    admin.firestore()
        .collection('recipes')
        .add(newRecipe)
        .then(doc => {
            res.json({ message: `document ${doc.id} created successfully` });
        })
        .catch(err => {
            res.status(500).json({ error: 'something went wrong' });
            console.log(err);
        })
})

exports.api = functions.https.onRequest(app);