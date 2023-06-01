import { appConfig } from './config/app.config';
import express from './config/express'

const PORT = appConfig.port || 3000

express.listen(PORT, () => {
    console.log(`Service running at http://localhost/${PORT}`);
});
