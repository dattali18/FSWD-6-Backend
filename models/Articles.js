/**
 * @desc This file will contain all the needed function to the articles collection in MongoDB or in MySQL.
 * all the function will be async
 */

const mongoose = require("mongoose");
const Articles = require("../database/MongoDB/ArticlesSchema");

// import the connection to the database
const mysqlDB = require("../database/MySQL/connection");
const { connection } = require("mongoose");

/**
 * @desc Article - class that will represent the article object
 * @property title : string
 * @property author : number
 * @property tags : [string]
 * @property content : string
 * @property articleId : number
 */
class Article {
  /**
   * @desc constructor for the article
   * @param title : string
   * @param author : number
   * @param tags : [string]
   * @param content : string
   */
  constructor(title, author, tags, content) {
    this.title = title;
    this.author = author;
    this.content = content;
    this.tags = tags;
  }
}

/**
 * @desc This function will create a new article in the database
 * @param article : Article - the article to create
 * @returns {Promise<*>}
 */
async function createArticle(article) {
  // when creating a new article we need also to add the same article in the MySQL db
  // and store the _id of the article in the MySQL db in the article in the MongoDB db

  // create the article in the MySQL db
  const [result] = await mysqlDB.execute(
    "INSERT INTO Articles (title, user_id) VALUES (?, ?)",
    [article.title, article.author]
  );
  // add the id of the article in the MySQL db to the article in the MongoDB db
  article.articleId = result.insertId;

  // create the article in the MongoDB db
  const newArticle = new Articles(article);
  await newArticle.save();

  return result;
}

/**
 * @desc This function will get all the articles from the database
 * @param articleId : number - the id of the article to delete
 * @returns {Promise<*>}
 */
async function deleteArticle(articleId) {
  // when deleting an article we need also to delete the same article in the MySQL db
  // and delete the article in the MongoDB db

  // delete the article from the MySQL db
  await mysqlDB.execute("DELETE FROM Articles WHERE id = ?", [articleId]);
  // delete the article from the MongoDB db
  return Articles.deleteOne({ articleId: articleId });
}

/**
 * @desc This function will update an article in the database
 * @param articleId : number - the id of the article to update
 * @param {Object} article  - the new article data
 * @returns {Promise<*>}
 */
async function updateArticle(articleId, article) {
  // when updating an article we need also to update the same article in the MySQL db
  // and update the article in the MongoDB db

  /**
   * @param {Object} article
   * @property {string} title
   * @property {string} content
   * @property {[string]} tags
   */

  // get the article from the MongoDB db
  const oldArticle = await Articles.findOne({ articleId: articleId });
  // update the article in the MySQL db
  await mysqlDB.execute("UPDATE Articles SET title = ? WHERE id = ?", [
    article.title,
    articleId,
  ]);
  // update the article in the MongoDB db
  return Articles.updateOne({ articleId: articleId }, article);
}

/**
 * @desc This function will get all the articles from the database
 * @returns {Promise<*>}
 */
async function getArticles() {
  // get all the articles
  return Articles.find();
}

/**
 * @desc This function will get all the articles from the database
 * @param {function(*) boolean} predicate     (article) -> boolean
 * @returns {Promise<*>}
 */
async function getArticlesById(articleId) {
  // get all the articles
  return Articles.findOne({ articleId: articleId });
}

async function getArticlesByAuthor(authorId) {
  // get all the articles
  // send all the property except the content
  return Articles.find({ author: authorId }, { content: 0 });
}

module.exports = {
  Article,
  createArticle,
  deleteArticle,
  updateArticle,
  getArticles,
  getArticlesById,
  getArticlesByAuthor,
};
