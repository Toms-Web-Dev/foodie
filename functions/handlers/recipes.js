const { db } = require('../util/admin');

const { isEmpty, arrIsEmpty } = require('../util/validators');

exports.getAllRecipes = (req, res) => {
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
};

exports.postOneRecipe = (req, res) => {
    if (isEmpty(req.body.body)) {
        return res.status(400).json({ body: 'Description must not be empty' });
    }
    if (isEmpty(req.body.title)) {
        return res.status(400).json({ title: 'Title must not be empty' });
    }
    if (arrIsEmpty(req.body.ingredients)) {
        return res.status(400).json({ ingredients: 'Must add ingredients' });
    }

    const newRecipe = {
        title: req.body.title,
        body: req.body.body,
        userHandle: req.user.handle,
        ingredients: req.body.ingredients,
        keywords: req.body.keywords,
        userImage: req.user.imageUrl,
        likeCount: 0,
        CommentCount: 0,
        createdAt: new Date().toISOString(),
    };

    db.collection('recipes')
        .add(newRecipe)
        .then((doc) => {
            const resRecipe = newRecipe;
            resRecipe.recipeId = doc.id;
            res.json(resRecipe);
        })
        .catch((err) => {
            res.status(500).json({ error: 'something went wrong' });
            console.log(err);
        });
};

// Get one recipe
exports.getRecipe = (req, res) => {
    let recipeData = {};
    db.doc(`/recipes/${req.params.recipeId}`)
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'Recipe not found' });
            }
            recipeData = doc.data();
            recipeData.recipeId = doc.id;
            return db
                .collection('comments')
                .orderBy('createdAt', 'desc')
                .where('recipeId', '==', req.params.recipeId)
                .get();
        })
        .then((data) => {
            recipeData.comments = [];
            data.forEach((doc) => {
                recipeData.comments.push(doc.data());
            });
            return res.json(recipeData);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};

// Comment on recipe
exports.commentOnRecipe = (req, res) => {
    if (req.body.body.trim() === '')
        return res.status(400).json({ error: 'Must not be empty' });

    const newComment = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        recipeId: req.params.recipeId,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl,
    };

    db.doc(`/recipes/${req.params.recipeId}`)
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'Recipe not found' });
            }
            return doc.ref.update({
                commentCount: doc.data().commentCount + 1,
            });
        })
        .then(() => {
            return db.collection('comments').add(newComment);
        })
        .then(() => {
            res.json(newComment);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong' });
        });
};

// Like a recipe
exports.likeRecipe = (req, res) => {
    const likeDocument = db
        .collection('likes')
        .where('userHandle', '==', req.user.handle)
        .where('recipeId', '==', req.params.recipeId)
        .limit(1);

    const recipeDocument = db.doc(`/recipes/${req.params.recipeId}`);

    let recipeData;

    recipeDocument
        .get()
        .then((doc) => {
            if (doc.exists) {
                recipeData = doc.data();
                recipeData.recipeId = doc.id;
                return likeDocument.get();
            } else {
                return res.status(404).json({ error: 'Recipe not found' });
            }
        })
        .then((data) => {
            if (data.empty) {
                return db
                    .collection('likes')
                    .add({
                        recipeId: req.params.recipeId,
                        userHandle: req.user.handle,
                    })
                    .then(() => {
                        recipeData.likeCount++;
                        return recipeDocument.update({
                            likeCount: recipeData.likeCount,
                        });
                    })
                    .then(() => {
                        return res.json(recipeData);
                    });
            } else {
                return res.status(400).json({ error: 'Recipe already liked' });
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};

exports.unlikeRecipe = (req, res) => {
    const likeDocument = db
        .collection('likes')
        .where('userHandle', '==', req.user.handle)
        .where('recipeId', '==', req.params.recipeId)
        .limit(1);

    const recipeDocument = db.doc(`/recipes/${req.params.recipeId}`);

    let recipeData;

    recipeDocument
        .get()
        .then((doc) => {
            if (doc.exists) {
                recipeData = doc.data();
                recipeData.recipeId = doc.id;
                return likeDocument.get();
            } else {
                return res.status(404).json({ error: 'Recipe not found' });
            }
        })
        .then((data) => {
            if (data.empty) {
                return res.status(400).json({ error: 'Recipe not liked' });
            } else {
                return db
                    .doc(`/likes/${data.docs[0].id}`)
                    .delete()
                    .then(() => {
                        recipeData.likeCount--;
                        return recipeDocument.update({
                            likeCount: recipeData.likeCount,
                        });
                    })
                    .then(() => {
                        res.json(recipeData);
                    });
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};

// Delete recipe
exports.deleteRecipe = (req, res) => {
    const document = db.doc(`/recipes/${req.params.recipeId}`);
    document
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'Recipe not found' });
            }
            if (doc.data().userHandle !== req.user.handle) {
                return res.status(403).json({ error: 'Unauthorized' });
            } else {
                return document.delete();
            }
        })
        .then(() => {
            res.json({ message: 'Recipe deleted successfully' });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};
