// import JSEncrypt from 'jsencrypt';

// // Function to encrypt a message using RSA
// export const encryptMessage = (message, publicKey) => {
//   const encryptor = new JSEncrypt();
  
//   // Set the public key for encryption
//   encryptor.setPublicKey(publicKey);

//   // Encrypt the message
//   const encryptedMessage = encryptor.encrypt(message);

//   if (!encryptedMessage) {
//     throw new Error('Encryption failed');
//   }

//   // Return the encrypted message as a base64 string
//   return encryptedMessage;
// };

// // Function to decrypt a message using RSA
// export const decryptMessage = (encryptedMessage, privateKey) => {
//   const decryptor = new JSEncrypt();
  
//   // Set the private key for decryption
//   decryptor.setPrivateKey(privateKey);

//   // Decrypt the message
//   const decryptedMessage = decryptor.decrypt(encryptedMessage);

//   if (!decryptedMessage) {
//     throw new Error('Decryption failed');
//   }

//   // Return the decrypted message
//   return decryptedMessage;
// };


import *as crypto from 'crypto';
export const generateKeyPair = () => {
    // Generate a new RSA key pair
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
        },
        privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
        },
    });
    
    // Return the key pair
    return { publicKey, privateKey };
};

const { publicKey, privateKey } = generateKeyPair();
console.log('Public Key:', publicKey);
