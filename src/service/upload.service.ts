import api from '@/api';

export type UploadProgress = (percent: number) => void;

export async function uploadComprovante(
  fileUri: string,
  fileName: string,
  mimeType: string,
  onProgress?: UploadProgress,
): Promise<string> {
  const formData = new FormData();

  formData.append('file', {
    uri: fileUri,
    name: fileName,
    type: mimeType,
  } as any);

  const response = await api.post<{ url: string }>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: event => {
      if (event.total) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress?.(percent);
      }
    },
  });

  return response.data.url;
}
