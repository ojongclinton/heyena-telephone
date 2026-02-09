import type { ObjectItem } from '@/types/object';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204 || !text.trim()) return undefined as T;
  return JSON.parse(text) as T;
}

export async function getObjects(): Promise<ObjectItem[]> {
  const res = await fetch(`${API_URL}/objects`);
  return handleResponse<ObjectItem[]>(res);
}

export async function getObject(id: string): Promise<ObjectItem> {
  const res = await fetch(`${API_URL}/objects/${id}`);
  return handleResponse<ObjectItem>(res);
}

export async function createObject(
  title: string,
  description: string,
  imageUri: string,
  fileName: string = 'image.jpg',
  mimeType: string = 'image/jpeg'
): Promise<ObjectItem> {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);

  if (imageUri.startsWith('blob:')) {
    const blob = await fetch(imageUri).then((r) => r.blob());
    formData.append('image', blob, fileName);
  } else {
    formData.append('image', {
      uri: imageUri,
      type: mimeType,
      name: fileName,
    } as unknown as Blob);
  }

  const res = await fetch(`${API_URL}/objects`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse<ObjectItem>(res);
}

export async function deleteObject(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/objects/${id}`, { method: 'DELETE' });
  await handleResponse<void>(res);
}
