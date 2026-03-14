export function generateOrderNumber(): string {
  const randomValue = Math.floor(100000 + Math.random() * 900000);
  return randomValue.toString();
}
