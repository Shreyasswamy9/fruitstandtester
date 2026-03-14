export type TeeColor = {
  name: string;
  hex: string;
  image: string;
  images?: string[];
};

export type TeeVariant = {
  slug: 'gala-tshirt' | 'cameo-tshirt' | 'mutsu-tshirt' | 'fuji-tshirt';
  name: string;
  colors: TeeColor[];
};

export const TEE_VARIANTS: TeeVariant[] = [
  {
    slug: 'gala-tshirt',
    name: 'Gala Tee',
    colors: [
      { name: 'Broadway Noir', hex: '#000000', image: '/images/products/gala-tshirt/broadwaynoir/GN4.png' },
      { name: 'Sutton Place Snow', hex: '#ffffff', image: '/images/products/gala-tshirt/suttonplacesnow/GN6.png' },
      { name: 'Grasshopper', hex: '#85c96e', image: '/images/products/gala-tshirt/Grasshopper/GN3.png' },
      { name: 'Frosted Lemonade', hex: '#fff7a8', image: '/images/products/gala-tshirt/frostedlemonade/GN9.png' },
      { name: 'Ruby Red', hex: '#fd8987', image: '/images/products/gala-tshirt/ruby red/GN.png' },
      { name: 'Italian Ice', hex: '#c7eaff', image: '/images/products/gala-tshirt/italianice/GN1.png' },
    ],
  },
  {
    slug: 'cameo-tshirt',
    name: 'Cameo Tee',
    colors: [
      { name: 'Broadway Noir', hex: '#000000', image: '/images/products/cameo-tshirt/broadwaynoir/MN.png' },
      { name: 'Sutton Place Snow', hex: '#ffffff', image: '/images/products/cameo-tshirt/suttonplacesnow/MN1.png' },
    ],
  },
  {
    slug: 'mutsu-tshirt',
    name: 'Mutsu Tee',
    colors: [
      { name: 'Broadway Noir', hex: '#000000', image: '/images/products/mutsu-tshirt/broadwaynoir/N1.png' },
      { name: 'Sutton Place Snow', hex: '#ffffff', image: '/images/products/mutsu-tshirt/suttonplacesnow/N3.png' },
    ],
  },
  {
    slug: 'fuji-tshirt',
    name: 'Fuji Long Sleeve',
    colors: [
      { name: 'Arboretum', hex: '#0f5132', image: '/images/products/fuji-tshirt/Arboretum/F2.png' },
      { name: 'Hudson Blue', hex: '#243b5a', image: '/images/products/fuji-tshirt/Hudson blue/F1.png' },
      { name: 'Redbird', hex: '#c21010', image: '/images/products/fuji-tshirt/Redbird/F4.png' },
      { name: 'Broadway Noir', hex: '#000000', image: '/images/products/fuji-tshirt/Broadwaynoir/F3.png' },
    ],
  },
];

export const SIZE_OPTIONS = ["XS","S","M","L","XL","XXL"] as const;
export type SizeOption = typeof SIZE_OPTIONS[number];
