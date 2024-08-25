/**
 * @desc User model - will contain all the user related functions
 */

const connection = require("../database/MySQL/connection");
const bcrypt = require("bcrypt");

/**
 * @desc User - class that will represent the user object
 * @property username : string
 * @property email : string
 * @property password : string
 */
class User {
  /**
   * @desc constructor for the user
   * @param username : string
   * @param email : string
   * @param password : string
   */
  constructor(username, email, password) {
    this.username = username;
    this.email = email;
    this.password = password;
  }
}

/**
 * @desc This function will get all the users from the database
 * @returns {Promise<*[]>}
 */
async function getAllUsers() {
  try {
    const [rows] = await connection.execute("SELECT * FROM Users");
    return rows;
  } catch (error) {
    console.error("Error in getting all users", error);
    return [];
  }
}

/**
 * @desc This function will add a user to the database
 * @param user : User - the user to add to the database
 * @returns {Promise<*>}
 */
async function createUser(user) {
  try {
    // before inserting the password we will encrypt it
    user.password = await bcrypt.hash(user.password, 10);
    const [rows] = await connection.execute(
      "INSERT INTO Users (username, email, password) VALUES (?, ?, ?)",
      [user.username, user.email, user.password]
    );
    return rows;
  } catch (error) {
    console.error("Error in creating user", error);
    return [];
  }
}

/**
 * @desc This function will delete a user from the database
 * @param user_id
 * @returns {Promise<*|*[]>}
 */
async function deleteUser(user_id) {
  try {
    const [rows] = await connection.execute("DELETE FROM Users WHERE id = ?", [
      user_id,
    ]);
    return rows;
  } catch (error) {
    console.error("Error in deleting user", error);
    return [];
  }
}

/**
 * @desc get a user by the username
 * @param {string} username
 */
async function getUserByUsername(username) {
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM Users WHERE username = ?",
      [username]
    );
    return rows;
  } catch (error) {
    console.error("Error in getting user by username", error);
    return [];
  }
}

/**
 * @desc Get a user by id
 * @param {number} id - the id of the user
 * @returns {Promise<*>}
 */
async function getUserById(id) {
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM Users WHERE id = ?",
      [id]
    );
    return rows;
  } catch (error) {
    console.error("Error in getting user by id", error);
    return [];
  }
}

/**
 * @desc Update a user by id
 * @param {number} id - the id of the user
 * @param {Object} user - the user object
 * @returns {Promise<*>}
 *
 * @Note we **can't** update the password here
 */
async function updateUser(id, email) {
  try {
    const [rows] = await connection.execute(
      "UPDATE Users SET email = ? WHERE id = ?",
      [email, id]
    );
    return rows;
  } catch (error) {
    console.error("Error in updating user", error);
    return [];
  }
}

/**
 * @desc Update the user privileges
 * @param {number} id
 * @param {"admin" | "user" | "writer"} role
 */
async function updateUserPrivileges(id, role) {
  try {
    const [rows] = await connection.execute(
      "UPDATE Users SET role = ? WHERE id = ?",
      [role, id]
    );

    // update the admin and writer tables
    if (role === "admin") {
      await connection.execute("INSERT INTO Admins (user_id) VALUES (?)", [id]);
    } else {
      await connection.execute("DELETE FROM Admins WHERE user_id = ?", [id]);
    }

    if (role === "writer") {
      await connection.execute("INSERT INTO Writers (user_id) VALUES (?)", [
        id,
      ]);
    } else {
      await connection.execute("DELETE FROM Writers WHERE user_id = ?", [id]);
    }

    if (role === "user") {
      await connection.execute("DELETE FROM Admins WHERE user_id = ?", [id]);
      await connection.execute("DELETE FROM Writers WHERE user_id = ?", [id]);
    }

    return rows;
  } catch (error) {
    console.error("Error in updating user role", error);
    return [];
  }
}

module.exports = {
  User,
  getAllUsers,
  getUserById,
  createUser,
  deleteUser,
  getUserByUsername,
  updateUser,
  updateUserPrivileges,
};
