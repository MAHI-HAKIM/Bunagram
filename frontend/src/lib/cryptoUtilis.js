import { generateKeyPairSync, publicEncrypt, privateDecrypt } from 'crypto';

// Function to encrypt a message using the public key
export const encryptMessage = (message, publicKey) => {
  try {
    // Create a new instance of NodeRSA and import the public key
    const encryptedMessage = publicEncrypt(publicKey, Buffer.from(message)).toString('base64');
    
    // Return the encrypted message
    return encryptedMessage;
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
};

// Function to decrypt a message using the private key
export const decryptMessage = (encryptedMessage, privateKey) => {
  try {
    // Create a new instance of NodeRSA and import the private key
    const key = new NodeRSA(privateKey);
    
    // Decrypt the message using the private key
    const decryptedMessage = privateDecrypt(privateKey, Buffer.from(encryptedMessage, 'base64')).toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
};
