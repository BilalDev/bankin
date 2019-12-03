import express from "express";
import bodyParser from "body-parser";

import * as apiController from "./controllers/api";

export const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', apiController.run);
