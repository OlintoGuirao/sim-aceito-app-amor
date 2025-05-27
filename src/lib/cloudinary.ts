import { Cloudinary } from '@cloudinary/url-gen';

// Inicializa o Cloudinary
export const cld = new Cloudinary({
  cloud: {
    cloudName: 'ddi5cc9em'
  }
});

// Função para fazer upload de imagem
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'simaceito_preset');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/ddi5cc9em/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    throw error;
  }
}; 