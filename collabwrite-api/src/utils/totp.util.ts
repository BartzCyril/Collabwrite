import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

export function generateTOTPSecret() {
  const secret = speakeasy.generateSecret({
    name: 'CollabWrite',
    length: 32,
  });
  return secret.base32;
}

export function verifyTOTP(token: string, secret: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1,
  });
}

export function generateTOTPURL(email: string, secret: string): string {
  return speakeasy.otpauthURL({
    secret,
    label: email,
    issuer: 'CollabWrite',
    encoding: 'base32',
  });
}

export async function generateQRCode(url: string): Promise<string> {
  return qrcode.toDataURL(url);
}
