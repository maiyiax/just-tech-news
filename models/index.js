const User = require('./User');
const Post = require('./Post');
const Vote = require('./Vote');

// This association creates the reference for the id column in the User model to link to the corresponding foreign key pair, which is the user_id in the Post model
User.hasMany(Post, {
    foreignKey: 'user_id'
});

// reverse association of the above, a post can only belong to one user
Post.belongsTo(User, {
    foreignKey: 'user_id'
});

User.belongsToMany(Post, {
    through: Vote,
    as: 'voted_posts',
    foreignKey: 'user_id'
});

Post.belongsToMany(User, {
    through: Vote,
    as: 'voted_posts',
    foreignKey: 'post_id'
});

Vote.belongsTo(User, {
    foreignKey: 'user_id'
});

Vote.belongsTo(Post, {
    foreignKey: 'post_id'
});

User.hasMany(Vote, {
    foreignKey: 'user_id'
});

Post.hasMany(Vote, {
    foreignKey: 'post_id'
});

module.exports = { User, Post, Vote };