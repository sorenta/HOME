import { encryptResetNote as encrypt, decryptResetNote as decrypt } from './reset-notes-crypto';

describe('AES-GCM Encryption', () => {
  it('should encrypt and decrypt data correctly', async () => {
    const data = 'Sensitive data';

    const encrypted = await encrypt(data);
    const decrypted = await decrypt(encrypted);

    expect(decrypted).toBe(data);
  });
});
