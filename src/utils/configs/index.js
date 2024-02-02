import dotenv from 'dotenv';
dotenv.config();

import dev from "./dev.js";
import prod from './prod.js';

const environments = {
    dev: dev,
    prod: prod
}
const env = process.env.NODE_ENV || 'dev';
const configs = environments[env];

export default configs;