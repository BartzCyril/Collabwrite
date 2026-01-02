import { type Request, type Response, type NextFunction } from 'express';
import { validationResult, type ValidationChain } from 'express-validator';

export function validate(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Exécuter toutes les validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Retourner les erreurs de validation
    return res.status(400).json({
      error: 'Erreurs de validation',
      details: errors.array(),
    });
  };
}

export { validationResult }; 