const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dped93q3y/image/upload';
const UPLOAD_PRESET = 'profile_pics';

const uploadToCloudinary = async (imageUri: string): Promise<string> => {
  // Verifique se a URI da imagem é válida antes de prosseguir
  if (!imageUri) {
    throw new Error('A URI da imagem é inválida.');
  }

  try {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    } as any);

    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    // Verifique se a resposta do Cloudinary é válida
    const data = await response.json();
    if (response.ok) {
      return data.secure_url; // Retorna a URL da imagem no Cloudinary
    } else {
      throw new Error(`Erro no upload: ${data.message}`);
    }
  } catch (error) {
    console.error('Erro ao fazer upload para o Cloudinary:', error);
    throw error;
  }
};

export default uploadToCloudinary;
