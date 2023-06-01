const dotenv = require('dotenv');

dotenv.config()

export const appConfig = {
    port: process.env.PORT,
    sessionSecretKey: process.env.SESSION_SECRET_KEY
}