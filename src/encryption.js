async function encryptData(data, secretKey) {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secretKey),
      { name: 'AES-CBC', length: 256 },
      false,
      ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(16));

  const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv: iv },
      cryptoKey,
      encodedData
  );

  const encryptedArray = new Uint8Array(iv.length + encrypted.byteLength);
  encryptedArray.set(iv);
  encryptedArray.set(new Uint8Array(encrypted), iv.length);

  return Array.from(encryptedArray)
      .map(byte => ('0' + byte.toString(16)).slice(-2))
      .join('');
}

module.exports = encryptData;