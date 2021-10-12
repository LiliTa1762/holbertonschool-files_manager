import sha1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const email = req.body;
    const password = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    let user = await dbClient.findUser({ email });

    if (user) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashPassword = sha1(password);

    user = await dbClient.createUser({
      email,
      password: hashPassword,
    });

    return res.json(user);
  }
}

export default UsersController;
