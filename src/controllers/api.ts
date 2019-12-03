import { Response, Request, NextFunction } from "express";
import axios from "axios";
import config from "config";

const headers = {
  "Bankin-Version": <string>config.get("bankin_version"),
  "Client-Id": <string>config.get("client_id"),
  "Client-Secret": <string>config.get("secret_id")
};
const base_url = 'https://sync.bankin.com';

/**
 * get accounts for one user
 *
 * @param req
 * @param res
 * @param next
 */
export const run = (req: Request, res: Response, next: NextFunction) => {
  const params = {
    'email': 'user6@mail.com',
    'password': 'a!Strongp#assword2'
  };

  axios.post(
    `${base_url}/v2/authenticate`,
    params,
    { headers: headers }
  )
  .then(async response => {
    if (response.data.access_token) {
      let accounts = await getAccounts(response.data.access_token, '/v2/accounts?limit=20');

      res.send(`Total balance for all your accounts is ${accounts}`);
      next();
    }
    else {
      res.send('No access token')
      next();
    }
  })
  .catch(error => {
    res.send(error.message);
    next();
  })
};

const getAccounts = async (access_token: string, uri: string) => {
  let accounts: number = 0;
  let keep = true;

  while (keep) {
    let response = await reqAccounts(access_token, uri);
    let resources = response.data.resources;

    for (let index = 0; index < resources.length; index++) {
      const res = resources[index];

      accounts += res.balance;
    }

    if (response.data.pagination.next_uri === null) {
      keep = false;
    }
    else {
      uri = response.data.pagination.next_uri;
    }
  }

  return accounts;
};

const reqAccounts = async (access_token: string, uri: string) => {
  const h = Object.assign(headers, {"Authorization": `Bearer ${access_token}`});
  try {
    return await axios.get(`${base_url}${uri}`, { headers: h });
  }
  catch (err) {
    return err;
  }
};
