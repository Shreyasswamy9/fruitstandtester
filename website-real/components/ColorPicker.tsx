"use client";
import React from 'react';

export type ColorOption = {
  name: string;
  slug?: string;
  color: string;
  images?: string[];
  img?: string;
  bg?: string;
  border?: string;
};

interface Props {
  options: ColorOption[];
  selectedName: string;
  onSelect: (opt: ColorOption) => void;
  showLabel?: boolean;
}

const LIGHT_COLORS = ['#ffffff','#f9fafb','#fafbfc','#f5f5f5'];

export default function ColorPicker({ options, selectedName, onSelect, showLabel = true }: Props) {
  if (!options?.length) {
    return null;
  }

  if (options.length === 1) {
    return showLabel ? (
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700">
          Color: <span className="font-semibold text-gray-900">{options[0].name}</span>
        </p>
      </div>
    ) : null;
  }

  const selected = options.find(o => o.name === selectedName) || options[0];
  return (
    <div className="mb-6">
      {showLabel && (
        <p className="text-sm font-medium text-gray-700 mb-2">Color: <span className="font-semibold text-gray-900">{selected?.name}</span></p>
      )}
      <div className="flex gap-3 px-1" style={{ overflowX: 'auto', paddingTop: 6, paddingBottom: 6, minHeight: 56 }}>
        {options.map((opt) => {
          const isActive = selectedName === opt.name;
          const bgColor = (opt.color || '').toLowerCase();
          const border = isActive
            ? '2px solid #232323'
            : (LIGHT_COLORS.includes(bgColor) ? '2px solid #d1d5db' : (opt.border || '2px solid #fff'));
          const boxShadow = isActive ? '0 0 0 2px #232323' : '0 1px 4px 0 rgba(0,0,0,0.07)';
          return (
            <button
              key={opt.name}
              aria-label={opt.name}
              onClick={() => onSelect(opt)}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: opt.color,
                border,
                outline: 'none',
                boxShadow,
                display: 'inline-block',
                cursor: 'pointer',
                marginRight: 4,
              }}
              data-active={isActive || undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
