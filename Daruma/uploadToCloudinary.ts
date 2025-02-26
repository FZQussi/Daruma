const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dped93q3y/image/upload';
const UPLOAD_PRESET = 'profile_pics';

const uploadToCloudinary = async (imageUri: string) => {
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

    const data = await response.json();
    return data.secure_url; // Retorna a URL da imagem no Cloudinary
  } catch (error) {
    console.error('Erro ao fazer upload para o Cloudinary:', error);
    throw error;
  }
};

export default uploadToCloudinary;

