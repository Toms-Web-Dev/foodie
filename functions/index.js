const functions = require('firebase-functions');
const app = require('express')();

const FBAuth = require('./util/fbAuth');
const { db } = require('./util/admin');

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
    getAuthenticatedUser,
    getUserDetails,
    uploadRecipeImage,
} = require('./handlers/users');

// Recipe routes
app.get('/recipes', getAllRecipes);
app.post('/recipe', FBAuth, postOneRecipe);
app.post('/recipe/:recipeId/image', FBAuth, uploadRecipeImage);
app.get('/recipe/:recipeId', getRecipe);
app.get('/recipe/:recipeId/like', FBAuth, likeRecipe);
app.get('/recipe/:recipeId/unlike', FBAuth, unlikeRecipe);
app.post('/recipe/:recipeId/comment', FBAuth, commentOnRecipe);
app.delete('/recipe/:recipeId', FBAuth, deleteRecipe);

// Users routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.get('/user', FBAuth, getAuthenticatedUser);
app.get('/user/:handle', getUserDetails);

exports.api = functions.region('europe-west1').https.onRequest(app);

// Delete data related to the recipe
exports.onRecipeDelete = functions
    .region('europe-west1')
    .firestore.document('/recipes/{recipeId}')
    .onDelete((snapshot, context) => {
        const recipeId = context.params.recipeId;
        const batch = db.batch();
        return db
            .collection('comments')
            .where('recipeId', '==', recipeId)
            .get()
            .then((data) => {
                data.forEach((doc) => {
                    batch.delete(db.doc(`/comments/${doc.id}`));
                });
                return db
                    .collection('likes')
                    .where('recipeId', '==', recipeId)
                    .get();
            })
            .then((data) => {
                data.forEach((doc) => {
                    batch.delete(db.doc(`/likes/${doc.id}`));
                });
                return batch.commit();
            })
            .catch((err) => console.error(err));
    });
