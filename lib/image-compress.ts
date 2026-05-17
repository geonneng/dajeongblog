export interface CompressedImage {
  base64: string;
  mimeType: string;
  previewUrl: string;
  width: number;
  height: number;
}

const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.82;

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지를 불러올 수 없어요."));
    };
    img.src = url;
  });
}

function scaleDimensions(width: number, height: number): { width: number; height: number } {
  if (width <= MAX_EDGE && height <= MAX_EDGE) {
    return { width, height };
  }
  const ratio = Math.min(MAX_EDGE / width, MAX_EDGE / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

/**
 * 스마트폰 고용량 사진을 Canvas로 리사이즈·JPEG 압축 후 Base64로 반환합니다.
 */
export async function compressImageFile(file: File): Promise<CompressedImage> {
  const img = await loadImageFromFile(file);
  const { width, height } = scaleDimensions(img.naturalWidth, img.naturalHeight);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas를 사용할 수 없어요.");

  ctx.drawImage(img, 0, 0, width, height);

  const mimeType = "image/jpeg";
  const dataUrl = canvas.toDataURL(mimeType, JPEG_QUALITY);
  const base64 = dataUrl.split(",")[1] ?? "";

  return {
    base64,
    mimeType,
    previewUrl: dataUrl,
    width,
    height,
  };
}
