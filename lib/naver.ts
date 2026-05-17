export function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

export function buildBasicInfoFromNaverItem(item: {
  title: string;
  category: string;
  description: string;
  telephone: string;
  address: string;
  roadAddress: string;
}): string {
  const lines: string[] = [];
  const address = item.roadAddress || item.address;
  if (address) lines.push(`* ${address}`);
  if (item.telephone) lines.push(`☏ ${item.telephone}`);
  if (item.category) lines.push(`✓ ${item.category.replace(/>/g, " > ")}`);
  if (item.description) lines.push(`📝 ${item.description}`);
  return lines.join("\n");
}
