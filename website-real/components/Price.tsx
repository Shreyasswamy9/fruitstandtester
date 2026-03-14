import React from 'react';
import { useSurveyMode } from '@/hooks/useSurveyMode';

type PriceProp = {
  price: number | string;
  salePrice?: number | string;
  className?: string;
  strikeColor?: string;
};

const toNumber = (v: number | string) => {
  if (typeof v === 'number') return v;
  const n = Number(String(v).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : NaN;
};

const format = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Price({ price, salePrice, className, strikeColor }: PriceProp) {
  const isSurveyMode = useSurveyMode();
  
  // In survey mode, show "Coming Soon" instead of prices
  if (isSurveyMode) {
    return <span className={className}>Coming Soon</span>;
  }

  const p = toNumber(price);
  const sale = salePrice !== undefined ? toNumber(salePrice) : undefined;

  if (!Number.isFinite(p)) {
    return <span className={className}>{String(price)}</span>;
  }

  const showSale = sale !== undefined && Number.isFinite(sale) && Number(sale) < Number(p);

  if (!showSale) {
    return <span className={className}>{format(p)}</span>;
  }

  return (
    <span className={className}>
      <span className="line-through mr-2" style={strikeColor ? { color: strikeColor } : undefined}>{format(p)}</span>
      <span>{format(Number(sale))}</span>
    </span>
  );
}
