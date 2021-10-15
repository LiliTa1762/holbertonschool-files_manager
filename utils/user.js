import { ObjectId } from 'mongodb';
import sha1 from 'sha1';
import dbClient from './db';
import redisClient from './redis';

class User {
  /**
   * Checks for authorization credentials and decodes them from base64 format
   * @return  {Object}  User email and password
   */
  static extractUserCredentials(credentials) {
    const authArr = credentials.split(' ');
    if (authArr[0] !== 'Basic') return null;

    const userCredentials = Buffer.from(authArr[1], 'base64').toString();
    const [email, password] = userCredentials.split(':');
    return { email, password };
  }

  /**
   * Checks for the existence of a user and validate password
   * @return  {Object}  User document or null
   */
  static async validUser(credentials) {
    const userCredentials = this.extractUserCredentials(credentials);
    if (!userCredentials) return null;

    const { email, password } = userCredentials;
    const user = await dbClient.users.findOne({ email });
    if (!user) return null;
    const hashedPwd = sha1(password);
    if (hashedPwd === user.password) {
      return user;
    }
    return null;
  }

  /**
   * Checks for the existence of a user in the redis DB
   * @return  {Object}  User document or null
   */
  static async findUserByToken(token) {
    const userID = await redisClient.get(`auth_${token}`);
    if (userID === null) {
      return null;
    }
    const user = await dbClient.users.findOne({ _id: ObjectId(userID) });
    if (!user) return null;
    return user;
  }

  /**
   * Checks for the existence of a user and validate authorization
   * @return  {Object}  User document or null
   */
  static async checkAuthorization(request) {
    const token = request.header('X-Token');
    const user = await this.findUserByToken(token);
    if (!user) return null;
    return user;
  }
}

export default User;
