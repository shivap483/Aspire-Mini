import express from './config/express'

const PORT = process.env.PORT || 3000

express.listen(PORT, () => {
    console.log(`Service running at http://localhost/${PORT}`);
});
