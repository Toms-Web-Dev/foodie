const functions = require("firebase-functions");
const admin = require('firebase-admin');

admin.initializeApp();

const express = require('express');
const app = express();

// Get latest recipes
app.get('/recipes', (req, res) => {
    admin
        .firestore()
        .collection('recipes')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let recipes = []
            data.forEach((doc) => {
                recipes.push({
                    recipeId: doc.id,
                    body: doc.data().body,
                    title: doc.data().title,
                    userHandle: doc.data().userHandle,
                    ingredients: doc.data().ingredients,
                    keywords: doc.data().keywords,
                    createdAt: doc.data().createdAt,
                });
            });
            return res.json(recipes);
        })
        .catch(err => console.error(err))
})

// Create new recipe
app.post('/recipe', (req, res) => {
    const newRecipe = {
        title: req.body.title,
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString(),
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

exports.api = functions.region('europe-west1').https.onRequest(app);