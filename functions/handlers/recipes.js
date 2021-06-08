const { db } = require('../util/admin');

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
};
