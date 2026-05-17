export interface NaverLocalItem {
  title: string;
  link: string;
  category: string;
  description: string;
  telephone: string;
  address: string;
  roadAddress: string;
}

export interface InterviewQuestion {
  id: string;
  text: string;
}

export interface HistoryItem {
  id: string;
  date: string;
  topic: string;
  content: string;
}

// ─── 카테고리 타입 ─────────────────────────────────────────
export type BlogCategory = "food" | "daily" | "product";

export interface FoodFields {
  placeName: string;
  address: string;
  basicInfo: string;
  menu: string;
  tasteDetail: string;
  atmosphere: string;
}

export interface DailyFields {
  topic: string;
  emotion: string;
  weather: string;
  message: string;
}

export interface ProductFields {
  productName: string;
  price: string;
  reason: string;
  prosCons: string;
  recommendation: string;
}

export interface ImageItem {
  id: string;
  previewUrl: string;
  imageBase64: string;
  imageMimeType: string;
}

export interface BlogFormData {
  blogCategory: BlogCategory;
  food: FoodFields;
  daily: DailyFields;
  product: ProductFields;
  images: ImageItem[];
}

// ─── 레거시 (Wizard 흐름 호환) ──────────────────────────────
export interface WizardFormData {
  placeName: string;
  address: string;
  category: string;
  basicInfo: string;
  imageAnalysis: string;
  imageBase64?: string | null;
  imageMimeType?: string | null;
  interviewQuestions: InterviewQuestion[];
  interviewAnswers: Record<string, string>;
}
