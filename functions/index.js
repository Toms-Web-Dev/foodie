const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

admin.initializeApp();

const firebaseConfig = {
    apiKey: 'AIzaSyCqKcW9xq2XTIYElMrXMcYk40I_0hM_YFI',
    authDomain: 'foodie-1bf29.firebaseapp.com',
    projectId: 'foodie-1bf29',
    storageBucket: 'foodie-1bf29.appspot.com',
    messagingSenderId: '1006136715732',
    appId: '1:1006136715732:web:b40fce35ace6eebbbe4e41',
    measurementId: 'G-924TJLHTJW',
};

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

// Get latest recipes
app.get('/recipes', (req, res) => {
    db.collection('recipes')
        .orderBy('createdAt', 'desc')
        .get()
        .then((data) => {
            let recipes = [];
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
        .catch((err) => console.error(err));
});

// Create new recipe
app.post('/recipe', (req, res) => {
    const newRecipe = {
        title: req.body.title,
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString(),
        ingredients: req.body.ingredients,
        keywords: req.body.keywords,
    };

    db.collection('recipes')
        .add(newRecipe)
        .then((doc) => {
            res.json({ message: `document ${doc.id} created successfully` });
        })
        .catch((err) => {
            res.status(500).json({ error: 'something went wrong' });
            console.log(err);
        });
});

// Check if string is email
const isEmail = (email) => {
    const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

// Check if string is empty
const isEmpty = (string) => {
    if (string.trim() === '') {
        return true;
    } else {
        return false;
    }
};

// Signup route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };

    let errors = {};

    if (isEmpty(newUser.email)) {
        errors.email = 'Must not be empty';
    } else if (!isEmail(newUser.email)) {
        errors.email = 'Email address not valid';
    }

    if (isEmpty(newUser.password)) errors.password = 'Must not be empty';
    if (newUser.password !== newUser.confirmPassword)
        errors.confirmPassword = 'Passwords must match';
    if (isEmpty(newUser.handle)) errors.handle = 'Must not be empty';

    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    // TODO validate data
    let token, userId;
    db.doc(`/users/${newUser.handle}`)
        .get()
        .then((doc) => {
            if (doc.exists) {
                return res
                    .status(400)
                    .json({ handle: 'this handle is already taken' });
            } else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(
                        newUser.email,
                        newUser.password
                    );
            }
        })
        .then((data) => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then((idToken) => {
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId,
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(() => {
            return res.status(201).json({ token });
        })
        .catch((err) => {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                return res
                    .status(400)
                    .json({ email: 'Email is already in use' });
            } else {
                return res.status(500).json({ error: err.code });
            }
        });
});

app.post('/login', (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password,
    };

    let errors = {};

    if (isEmpty(user.email)) errors.email = 'Must not be empty';
    if (isEmpty(user.password)) errors.password = 'Must not be empty';

    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then((data) => {
            return data.user.getIdToken();
        })
        .then((token) => {
            return res.json({ token });
        })
        .catch((err) => {
            console.error(err);
            if (err.code === 'auth/wrong-password') {
                return res
                    .status(403)
                    .json({ general: 'Wrong password, try again' });
            } else {
                return res.status(500).json({ error: err.code });
            }
        });
});

exports.api = functions.region('europe-west1').https.onRequest(app);
