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

// Function to encrypt a message using RSA
export const encryptMessage = (message, publicKey) => {
    // Encrypt the message using the public key
    const encryptedMessage = crypto.publicEncrypt(
        {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
        },
        Buffer.from(message, 'utf8')
    );
    
    // Return the encrypted message
    return encryptedMessage.toString('base64');
    };

// Function to decrypt a message using RSA
export const decryptMessage = (encryptedMessage, privateKey) => {
    // Decrypt the message using the private key
    const decryptedMessage = crypto.privateDecrypt(
        {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
        },
        Buffer.from(encryptedMessage, 'base64')
    );
    
    // Return the decrypted message
    return decryptedMessage.toString('utf8');
};  