import { hashPassword, comparePassword } from '../utils/bcrypt.util';

describe('bcrypt.util', () => {
  it('hashPassword puis comparePassword retournent true pour le bon mot de passe', async () => {
    const password = 'SuperSecret123!';
    const hash = await hashPassword(password);
    expect(hash).toMatch(/\$2[abxy]?\$/);
    const ok = await comparePassword(password, hash);
    expect(ok).toBe(true);
  });

  it('comparePassword retourne false pour un mauvais mot de passe', async () => {
    const hash = await hashPassword('CorrectPassword');
    const ok = await comparePassword('WrongPassword', hash);
    expect(ok).toBe(false);
  });
});


