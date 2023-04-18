import { message } from "antd";
import forge from "node-forge";

export const asymEncrypt = (decrpyted64, pubKey, returnType) => {
  try {
    const publicKeyObject = forge.pki.publicKeyFromPem(pubKey);
    const decryptedBuffer = forge.util.decode64(decrpyted64);

    const encryptedBuffer = publicKeyObject.encrypt(decryptedBuffer);

    const encodedEncrypt = forge.util.encode64(encryptedBuffer);
    if (returnType === "buffer") {
      return encryptedBuffer;
    } else {
      return encodedEncrypt;
    }
  } catch (err) {
    console.log("Failed to encrypt key. " + err.message);
  }
};

export const asymDecrypt = (encrypt64, privKey, returnType) => {
  try {
    const encryptedBuffer = forge.util.decode64(encrypt64);
    const privateKeyObject = forge.pki.privateKeyFromPem(privKey);
    const decryptedBuffer = privateKeyObject.decrypt(encryptedBuffer);
    if (returnType === "buffer") {
      return decryptedBuffer;
    } else {
      symKeyBase64 = forge.util.decode64(decryptedBuffer);
      return symKeyBase64;
    }
  } catch (err) {
    console.log("Failed to decrypt key. " + err.message);
  }
};

export const aesEncrypt = (data, key, returnType) => {
  // stuff
  const iv = forge.random.getBytesSync(16);
  const aesKeyBytes = forge.util.decode64(key);

  const cipher = forge.cipher.createCipher("AES-CBC", aesKeyBytes);
  cipher.start({ iv });
  cipher.update(data);
  cipher.finish();

  const encryptedData64 = forge.util.encode64(cipher.output.getBytes());
  const encodedIV = forge.util.encode64(iv);

  return { encryptedData64, encodedIV };
};

export const aesDecrypt = (data, iv, key) => {
  const aesKeyBytes = forge.util.decode64(key);
  const ivDecoded = forge.util.decode64(iv);

  const decipher = forge.cipher.createDecipher("AES-CBC", aesKeyBytes);
  decipher.start({ iv: ivDecoded });
  decipher.update(forge.util.createBuffer(data));
  decipher.finish();

  const base64 = forge.util.encode64(decipher.output.getBytes());
  return base64;
};

export const aesDecryptFromRand = (data, key) => {
  const iv = forge.util.decode64(data.slice(0, 24));
  const encrypted = forge.util.decode64(data.slice(24));

  const decipher = forge.cipher.createDecipher("AES-CBC", key);
  decipher.start({ iv });
  decipher.update(forge.util.createBuffer(encrypted));
  decipher.finish();

  return decipher.output;
};

export const desEncrypt = (data, key) => {
  const iv = forge.random.getBytesSync(8);
  const DESKeyBytes = forge.util.decode64(key);

  const cipher = forge.cipher.createCipher("3DES-CBC", DESKeyBytes);
  cipher.start({ iv: iv });
  cipher.update(data);
  cipher.finish();

  const encryptedData = forge.util.encode64(cipher.output.getBytes());
  const encodedIV = forge.util.encode64(iv);

  return { encryptedData, encodedIV };
};

export const desDecrypt = (data, iv, key) => {
  const ivDecoded = forge.util.decode64(iv);
  const DESKeyBytes = forge.util.decode64(key);

  const decipher = forge.cipher.createDecipher("3DES-CBC", DESKeyBytes);
  decipher.start({ iv: ivDecoded });
  decipher.update(forge.util.createBuffer(data));
  decipher.finish();

  const decryptedData = forge.util.encode64(decipher.output.getBytes());
  return decryptedData;
};
