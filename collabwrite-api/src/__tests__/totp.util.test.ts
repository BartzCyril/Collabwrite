import { generateTOTPSecret, generateTOTPURL, verifyTOTP } from '../utils/totp.util';
import speakeasy from 'speakeasy';

describe('totp.util', () => {
  it('génère un secret et une URL valides', () => {
    const secret = generateTOTPSecret();
    expect(typeof secret).toBe('string');
    const url = generateTOTPURL('user@example.com', secret);
    expect(url).toContain('otpauth://totp/');
  });

  it('vérifie un TOTP valide pour le secret', () => {
    const secret = generateTOTPSecret();
    const token = speakeasy.totp({ secret, encoding: 'base32' });
    const valid = verifyTOTP(token, secret);
    expect(valid).toBe(true);
  });
});


