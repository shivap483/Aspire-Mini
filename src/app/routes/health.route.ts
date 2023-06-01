import express from 'express';

const router = express.Router();

router.get(
  '/health',
  (req: any, res: any) => {
    console.log('health check')
    res.send('service working')
  }
);

export default router;
