import { Request, Response } from 'express';

type IController = (req: Request, res: Response) => void;
export default IController;
