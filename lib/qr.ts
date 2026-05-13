import QRCode from 'qrcode';

/** Returns a base64 PNG data URL for the given text/UPI link */
export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 300,
    color: { dark: '#000000', light: '#ffffff' },
  });
}
