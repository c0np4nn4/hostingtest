const SECRET_KEY = 'secret value'; // Replace this with a secure key
const LOCAL_STORAGE_KEY = 'encrypted_api_key';

// Encrypt the API key using AES
function encryptApiKey(apiKey) {
  return CryptoJS.AES.encrypt(apiKey, SECRET_KEY).toString();
}

// Decrypt the API key using AES
function decryptApiKey(encryptedApiKey) {
  const bytes = CryptoJS.AES.decrypt(encryptedApiKey, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Save the encrypted API key to localStorage
document.getElementById('save-api-key-btn').addEventListener('click', () => {
  const apiKeyInput = document.getElementById('api-key-input').value.trim();
  if (apiKeyInput) {
    const encryptedKey = encryptApiKey(apiKeyInput);
    localStorage.setItem(LOCAL_STORAGE_KEY, encryptedKey);
    alert('API key registered successfully!');
  } else {
    alert('Please enter a valid API key.');
  }
});

// Retrieve and decrypt the API key from localStorage
function getDecryptedApiKey() {
  const encryptedApiKey = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (encryptedApiKey) {
    return decryptApiKey(encryptedApiKey);
  }
  return null;
}

// Example usage: Get the decrypted API key
const decryptedKey = getDecryptedApiKey();
if (decryptedKey) {
  console.log('Decrypted API Key:', decryptedKey);
}
