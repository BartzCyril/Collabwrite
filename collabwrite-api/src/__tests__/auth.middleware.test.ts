import { authenticateToken, type AuthRequest } from '../middleware/auth.middleware';
import * as jwtUtil from '../utils/jwt.util';

describe('auth.middleware', () => {
  const next = jest.fn();
  const res: any = {
    status: jest.fn(),
    json: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('401 si header manquant', () => {
    const req = { headers: {} } as AuthRequest;
    (res.status as jest.Mock).mockReturnValue(res);
    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('passe au next si token valide', () => {
    jest.spyOn(jwtUtil, 'verifyAccessToken').mockReturnValue({
      userId: 'u1', email: 'user@example.com', role: 'USER',
    } as any);
    (res.status as jest.Mock).mockReturnValue(res);
    const req = { headers: { authorization: 'Bearer token' } } as any;
    authenticateToken(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user?.id).toBe('u1');
  });

  it('403 si token invalide', () => {
    jest.spyOn(jwtUtil, 'verifyAccessToken').mockImplementation(() => { throw new Error('invalid'); });
    (res.status as jest.Mock).mockReturnValue(res);
    const req = { headers: { authorization: 'Bearer token' } } as any;
    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});


