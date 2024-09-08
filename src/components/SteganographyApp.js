import React, { useState } from 'react';
import { encodeMessageInImage, decodeMessageFromImage } from '../utils/steganographyUtils'; // Adjust the path

const SteganographyApp = () => {
  const [hiddenMessage, setHiddenMessage] = useState("");
  const [encodedImageUrl, setEncodedImageUrl] = useState(null);
  const [encodedImageBlob, setEncodedImageBlob] = useState(null);
  const [decodedMessage, setDecodedMessage] = useState('');
  const [error, setError] = useState('');
  const [disabled, setDisabled] = useState(false);

  const handleFileRead = (file, onLoad) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        onLoad(reader.result);
        setError('');
      } catch (e) {
        console.error('Error processing file:', e.message);
        setError('Error processing file. Please try again.');
      }
    };
    reader.onerror = (err) => {
      console.error('File reading error:', err);
      setError('Error reading file. Please try again.');
    };
    reader.readAsDataURL(file); // Ensure proper format handling
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if(!hiddenMessage) return;
    const message = hiddenMessage;

    if (file) {
      handleFileRead(file, (fileDataUrl) => {
        console.log('File data URL:', fileDataUrl);
        const image = new Image();
        
        image.onload = () => {
          console.log('Image loaded successfully');
          console.log('Image dimensions:', image.width, image.height);
          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          try {
            const encodedImageDataUrl = encodeMessageInImage(imageData, message);
            console.log('Encoded image data URL:', encodedImageDataUrl);
            
            // Convert data URL to Blob
            fetch(encodedImageDataUrl)
              .then(res => res.blob())
              .then(blob => {
                setEncodedImageUrl(encodedImageDataUrl);
                setEncodedImageBlob(blob);
                setError('');
              })
              .catch(e => {
                console.error('Blob creation error:', e.message);
                setError('Error creating downloadable image.');
              });
          } catch (e) {
            console.error('Encoding error:', e.message);
            setError('Error encoding message in image.');
          }
        };
        
        image.onerror = (err) => {
          console.error('Image loading error:', err);
          setError('Error loading image.');
        };
        
        image.src = fileDataUrl;
      });
    }
  };

  const handleImageDecode = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileRead(file, (fileDataUrl) => {
        const image = new Image();
        
        image.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          try {
            const message = decodeMessageFromImage(imageData);
            const cleanedStr = message.replace(/\s+/g, '');
            const base64Regex = /^[A-Za-z0-9+/=]+$/;
            if(base64Regex.test(cleanedStr)){
              setDecodedMessage(message);
              setError('');
            }
            else{
              setError("Message not found");
            }
            
          } catch (e) {
            console.error('Decoding error:', e.message);
            setError('Error decoding message from image.');
          }
        };

        image.onerror = (err) => {
          console.error('Image loading error:', err);
          setError('Error loading image.');
        };

        image.src = fileDataUrl;
      });
    }
  };

  const downloadEncodedImage = () => {
    if (encodedImageBlob) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(encodedImageBlob);
      link.download = "fingerprint.png";
      link.click();
    } else {
      setError('No encoded image available for download.');
    }
  };

  return (
    <div>
      <h1>Steganography App</h1>

      <div>
        {!disabled && <h2>Hidden Message</h2>}
        {!disabled && <input type='text' onChange={e => setHiddenMessage(e.target.value)} value={hiddenMessage}/>}
        {(!disabled && hiddenMessage.length > 0) && <button onClick={() => setDisabled(true)}>Submit</button>}
        {disabled && <h2><span style={{ fontWeight: "normal" }}>Hidden Message: </span>{hiddenMessage}</h2>}
        {(hiddenMessage && disabled) && <h2>Upload and Encode Image</h2>}
        {(hiddenMessage && disabled) && <input type="file" accept="image/*" onChange={handleImageUpload} />}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {encodedImageUrl && (
          <div>
            <img src={encodedImageUrl} alt="Encoded" style={{ maxWidth: '100%' }} />
            <button onClick={downloadEncodedImage}>Download Encoded Image</button>
          </div>
        )}
      </div>

      <div>
        <h2>Decode Image</h2>
        <input type="file" accept="image/*" onChange={handleImageDecode} />
        {decodedMessage && <p>Decoded Message: {decodedMessage}</p>}
      </div>
    </div>
  );
};

export default SteganographyApp;
