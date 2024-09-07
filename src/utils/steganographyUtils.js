/**
 * Encode a message into the image data
 * @param {ImageData} imageData
 * @param {string} message
 * @returns {string} Data URL of the encoded image
 */
export const encodeMessageInImage = (imageData, message) => {
  try {
    const messageBytes = new TextEncoder().encode(message + '\0'); // Append null terminator
    const data = imageData.data;

    let bitIndex = 0;
    for (let i = 0; i < messageBytes.length; i++) {
      for (let bit = 0; bit < 8; bit++) {
        const bitValue = (messageBytes[i] >> bit) & 1;
        if (bitIndex >= data.length) {
          throw new Error('Image data buffer is too small for the message.');
        }
        data[bitIndex] = (data[bitIndex] & 0xFE) | bitValue;
        bitIndex++;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  } catch (e) {
    console.error('Error during encoding:', e.message);
    throw e;
  }
};

/**
 * Decode a message from the image data
 * @param {ImageData} imageData
 * @returns {string}
 */
export const decodeMessageFromImage = (imageData) => {
  const data = imageData.data;

  let message = '';
  let byte = 0;
  let bitCount = 0;

  for (let i = 0; i < data.length; i++) {
    byte |= (data[i] & 1) << bitCount;
    bitCount++;

    if (bitCount === 8) {
      if (byte === 0) break; // End of message
      message += String.fromCharCode(byte);
      byte = 0;
      bitCount = 0;
    }
  }

  return message;
};
