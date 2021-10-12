import dbClient from '../utils/db';
import sha1 from 'sha1';

class UsersController {
  static async postNew(req, res) {
    const email = req.body;
    const password = req.body;

    if (!email) {
      return res.status(400).send({error: 'Missing email'});
    }
    if (!password) {
      return res.status(400).send({error: 'Missing password'});
    }

    let user = await dbClient.findUser({ email });

    if (user) {
      return res.status(400).send({error: 'Already exist'});
    }

    const hashPassword = sha1(password);

    user= await dbClient.users.insertOne({
      email,
      password: hashPassword,
    });

    return res.json(user);
  };
}
