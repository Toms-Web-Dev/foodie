const functions = require('firebase-functions');
const app = require('express')();

const FBAuth = require('./util/fbAuth');

const {
    getAllRecipes,
    postOneRecipe,
    getRecipe,
    commentOnRecipe,
    likeRecipe,
    unlikeRecipe,
    deleteRecipe,
} = require('./handlers/recipes');
const {
    signup,
    login,
    uploadImage,
    addUserDetails,
    getAuthenticatedUser,
} = require('./handlers/users');

// Recipe routes
app.get('/recipes', getAllRecipes);
app.post('/recipe', FBAuth, postOneRecipe);
app.get('/recipe/:recipeId', getRecipe);
app.get('/recipe/:recipeId/like', FBAuth, likeRecipe);
app.get('/recipe/:recipeId/unlike', FBAuth, unlikeRecipe);
app.post('/recipe/:recipeId/comment', FBAuth, commentOnRecipe);
app.delete('/recipe/:recipeId', FBAuth, deleteRecipe);

// Users routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);

exports.api = functions.region('europe-west1').https.onRequest(app);
