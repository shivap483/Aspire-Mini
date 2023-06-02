import application from '../constants/application';
import healthRoute from '../routes/health.route';
import indexRoute from '../routes/index.route';


import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import { appConfig } from './app.config';
const app = express();




declare module 'express-session' {
    interface SessionData {
        userId?: number; // Replace with the appropriate type for your userId
        email?: string;
    }
}


// to parse json requests
app.use(bodyParser.json());
app.use(session({
    secret: appConfig.sessionSecretKey,
    resave: false,
    saveUninitialized: false
}))
// root logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${req.ip}`);
    next();
})
// health check endpoint. we can checkdb connections here. currently dummy as there is not db for this project
app.use('/', healthRoute);
// routing the requests to appropriate routes
app.use(application.url.base, indexRoute);
// adding middleware logger
app.use((req: any, res: any, next: any) => {
    console.log(`${req.method} ${req.path} - ${req.ip}`);
    next();
})





export default app;