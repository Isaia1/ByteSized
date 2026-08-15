/** Keep digits only so UPC/EAN/ITF scans compare cleanly. */
export function normalizeBarcode(raw: string): string {
  return raw.replace(/\D/g, '');
}

function upcCheckDigit(eleven: string): string {
  let sum = 0;
  for (let i = 0; i < eleven.length; i += 1) {
    const n = Number(eleven[i]);
    sum += i % 2 === 0 ? n * 3 : n;
  }
  return String((10 - (sum % 10)) % 10);
}

/** Expand a UPC-E code to UPC-A so pantry scans still match the catalog. */
export function expandUpcE(raw: string): string | null {
  const digits = normalizeBarcode(raw);
  let ns = '0';
  let body = '';
  let check = '';

  if (digits.length === 8) {
    ns = digits[0];
    body = digits.slice(1, 7);
    check = digits[7];
  } else if (digits.length === 7) {
    ns = digits[0];
    body = digits.slice(1);
  } else if (digits.length === 6) {
    body = digits;
  } else {
    return null;
  }

  if (!/^[01]$/.test(ns) || body.length !== 6) {
    return null;
  }

  const last = body[5];
  let manufacturer = '';
  let product = '';

  if (last === '0' || last === '1' || last === '2') {
    manufacturer = `${body.slice(0, 2)}${last}00`;
    product = `00${body.slice(2, 5)}`;
  } else if (last === '3') {
    manufacturer = `${body.slice(0, 3)}00`;
    product = `000${body.slice(3, 5)}`;
  } else if (last === '4') {
    manufacturer = `${body.slice(0, 4)}0`;
    product = `0000${body[4]}`;
  } else {
    manufacturer = body.slice(0, 5);
    product = `0000${last}`;
  }

  const eleven = `${ns}${manufacturer}${product}`;
  return `${eleven}${check || upcCheckDigit(eleven)}`;
}

function extractGs1Gtin(raw: string): string | null {
  const digitalLink = raw.match(/\/01\/(\d{8,14})(?:[/?#]|$)/);
  if (digitalLink) return digitalLink[1];

  const paren = raw.match(/\(01\)(\d{8,14})/);
  if (paren) return paren[1];

  const compact = raw.match(/(?:^|[^0-9])01(\d{14})(?:[^0-9]|$)/);
  if (compact) return compact[1];

  const digits = normalizeBarcode(raw);
  if (digits.startsWith('01') && digits.length >= 16) {
    return digits.slice(2, 16);
  }

  return null;
}

/**
 * Pull a usable product code out of whatever the camera returned:
 * EAN/UPC, GS1 QR, Data Matrix, or store Code 128.
 */
export function extractBarcode(raw: string, type?: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const gs1 = extractGs1Gtin(trimmed);
  if (gs1) return gs1;

  if (/^https?:\/\//i.test(trimmed)) {
    return '';
  }

  const digits = normalizeBarcode(trimmed);

  if (type === 'upc_e') {
    return expandUpcE(digits) ?? digits;
  }

  if (digits.length >= 8 && digits.length <= 14) {
    return digits;
  }

  if (digits.length > 14) {
    return digits.slice(0, 14);
  }

  if (digits.length >= 4) {
    return digits;
  }

  return trimmed.replace(/\s+/g, '');
}

export function isScannableCode(code: string): boolean {
  const digits = normalizeBarcode(code);
  return digits.length >= 4 || code.length >= 4;
}

/**
 * Local packs often print UPC-A, EAN-13, ITF-14, or UPC-E for the same product.
 * Try every common packing so a Trinidad barcode still matches.
 */
export function barcodeVariants(raw: string): string[] {
  const extracted = extractBarcode(raw) || normalizeBarcode(raw);
  const digits = normalizeBarcode(extracted);
  if (!digits) return extracted ? [extracted] : [];

  const variants = new Set<string>([digits, extracted]);

  const expanded = expandUpcE(digits);
  if (expanded) {
    variants.add(expanded);
    variants.add(`0${expanded}`);
  }

  if (digits.length === 12) {
    variants.add(`0${digits}`);
  }

  if (digits.length === 13 && digits.startsWith('0')) {
    variants.add(digits.slice(1));
  }

  if (digits.length === 14) {
    variants.add(digits.slice(1));
    if (digits.startsWith('00')) {
      variants.add(digits.slice(2));
    }
  }

  if (digits.length < 13) {
    variants.add(digits.padStart(13, '0'));
  }

  if (digits.length === 13) {
    variants.add(`0${digits}`);
  }

  if (digits.length === 8) {
    variants.add(digits.padStart(12, '0'));
    variants.add(digits.padStart(13, '0'));
  }

  return [...variants].filter(Boolean);
}
