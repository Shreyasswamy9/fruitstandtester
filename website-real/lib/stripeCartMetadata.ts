const CART_KEY = 'cart';
const CART_PARTS_KEY = 'cart_parts';
const CART_PART_PREFIX = 'cart_part_';
const CART_CHUNK_SIZE = 450;

type MetadataLike = Record<string, string | null | undefined>;

type MetadataResult = Record<string, string>;

/**
 * Splits a JSON string into Stripe metadata-friendly chunks while keeping each value under 500 characters.
 */
export const serializeCartJson = (json: string): MetadataResult => {
  const safeJson = typeof json === 'string' ? json : '';
  if (!safeJson || safeJson.length <= CART_CHUNK_SIZE) {
    return { [CART_KEY]: safeJson || '[]' };
  }

  const metadata: MetadataResult = {
    [CART_PARTS_KEY]: String(Math.ceil(safeJson.length / CART_CHUNK_SIZE)),
  };

  let partIndex = 0;
  for (let i = 0; i < safeJson.length; i += CART_CHUNK_SIZE) {
    metadata[`${CART_PART_PREFIX}${partIndex}`] = safeJson.slice(i, i + CART_CHUNK_SIZE);
    partIndex += 1;
  }

  return metadata;
};

/**
 * Convenience wrapper around serializeCartJson for cart item arrays.
 */
export const serializeCartItems = (items: unknown[]): MetadataResult => {
  try {
    const json = JSON.stringify(Array.isArray(items) ? items : []);
    return serializeCartJson(json);
  } catch {
    return { [CART_KEY]: '[]' };
  }
};

/**
 * Generates metadata updates that clear any previously stored cart chunks.
 */
export const cleanupCartMetadata = (metadata?: MetadataLike | null): MetadataResult => {
  if (!metadata) {
    return {};
  }

  const cleanup: MetadataResult = {};

  if (metadata[CART_KEY] !== undefined) {
    cleanup[CART_KEY] = '';
  }

  if (metadata[CART_PARTS_KEY] !== undefined) {
    cleanup[CART_PARTS_KEY] = '';
  }

  let index = 0;
  while (true) {
    const key = `${CART_PART_PREFIX}${index}`;
    if (!(key in metadata)) {
      break;
    }
    cleanup[key] = '';
    index += 1;
  }

  return cleanup;
};

/**
 * Reassembles and returns the cart JSON string from Stripe metadata.
 */
export const readCartMetadata = (metadata?: MetadataLike | null): string | null => {
  if (!metadata) {
    return null;
  }

  const directCart = metadata[CART_KEY];
  if (typeof directCart === 'string' && directCart.length > 0) {
    return directCart;
  }

  const declaredPartsRaw = metadata[CART_PARTS_KEY];
  if (typeof declaredPartsRaw === 'string' && declaredPartsRaw.length > 0) {
    const declaredCount = Number(declaredPartsRaw);
    if (Number.isFinite(declaredCount) && declaredCount > 0) {
      const parts: string[] = [];
      for (let i = 0; i < declaredCount; i += 1) {
        const value = metadata[`${CART_PART_PREFIX}${i}`];
        if (typeof value !== 'string') {
          return null;
        }
        parts.push(value);
      }
      if (parts.length === declaredCount) {
        return parts.join('');
      }
    }
  }

  const inferredParts: string[] = [];
  let inferredIndex = 0;
  while (true) {
    const key = `${CART_PART_PREFIX}${inferredIndex}`;
    const value = metadata[key];
    if (typeof value !== 'string' || value.length === 0) {
      break;
    }
    inferredParts.push(value);
    inferredIndex += 1;
  }

  if (inferredParts.length > 0) {
    return inferredParts.join('');
  }

  return null;
};

export const CART_METADATA_CONSTANTS = {
  KEY: CART_KEY,
  PARTS_KEY: CART_PARTS_KEY,
  PART_PREFIX: CART_PART_PREFIX,
  CHUNK_SIZE: CART_CHUNK_SIZE,
} as const;
