async function encryptData(data, secretKey) {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
  
    // Convert the secret key to an appropriate format
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secretKey),
      { name: 'AES-CBC', length: 256 },
      false,
      ['encrypt']
    );
  
    // Generate an Initialization Vector (IV)
    const iv = crypto.getRandomValues(new Uint8Array(16));
  
    // Encrypt the data using AES-CBC
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv: iv },
      cryptoKey,
      encodedData
    );
  
    // Concatenate IV and encrypted data and convert it to a string for storage
    const encryptedArray = new Uint8Array(iv.length + encrypted.byteLength);
    encryptedArray.set(iv);
    encryptedArray.set(new Uint8Array(encrypted), iv.length);
  
    return Array.from(encryptedArray)
      .map(byte => ('0' + byte.toString(16)).slice(-2))
      .join('');
  }
module.exports = encryptData;
  