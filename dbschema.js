let db = {
    users: [
        {
            userId: 'tjox6rkK2FXzVuR8xFLlhq4BGOv1',
            email: 'user@email.com',
            handle: 'user',
            createdAt: '2021-06-08T22:04:24.392Z',
            imageUrl:
                'https://firebasestorage.googleapis.com/v0/b/foodie-1bf29.appspot.com/o/376500959542.jpg?alt=media',
        },
    ],
    recipes: [
        {
            userHandle: 'user',
            title: 'Title of the recipe',
            body: 'this is the description',
            ingredients: ['flour', 'eggs'],
            keywords: ['breakfast', 'healthy'],
            createdAt: '2021-06-08T17:16:27.147Z',
            likeCount: 5,
            commentCount: 2,
        },
    ],
    comments: [
        {
            userHandle: 'user',
            recipeId: '6oT01QXvWSX1yhxS9ZfX',
            body: 'Very tasty!',
            createdAt: '2021-06-08T17:18:12.147Z',
        },
    ],
};
const userDetails = {
    credentials: {
        userId: 'tjox6rkK2FXzVuR8xFLlhq4BGOv1',
        email: 'user@email.com',
        handle: 'user',
        createdAt: '2021-06-08T22:04:24.392Z',
        imageUrl:
            'https://firebasestorage.googleapis.com/v0/b/foodie-1bf29.appspot.com/o/376500959542.jpg?alt=media',
    },
    likes: [
        {
            userHandle: 'user',
            recipeId: '6oT01QXvWSX1yhxS9ZfX',
        },
        {
            userHandle: 'user2',
            recipeId: '6oT01QXvWSX1yhxS9ZfX',
        },
        {
            userHandle: 'user3',
            recipeId: '6oT01QXvWSX1yhxS9ZfX',
        },
    ],
};
