import { BadRequestException } from '@nestjs/common';

// Every upload endpoint's existing validation checked only the client-
// supplied filename string (trivially spoofable) — this checks the actual
// file bytes instead. Not a full content parse, just enough to catch an
// arbitrary file renamed to look like the expected type.

export function assertPdfSignature(file: Express.Multer.File): void {
  if (file.buffer.length < 5 || file.buffer.subarray(0, 5).toString('latin1') !== '%PDF-') {
    throw new BadRequestException('This file does not appear to be a valid PDF.');
  }
}

// docx/xlsx/pptx are zip archives (PK.. magic bytes); legacy doc/xls/ppt
// are the OLE Compound File format (D0 CF 11 E0 A1 B1 1A E1).
const OLE_SIGNATURE = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);

export function assertOfficeSignature(file: Express.Multer.File): void {
  const header = file.buffer.subarray(0, 8);
  const isZip = header.length >= 2 && header[0] === 0x50 && header[1] === 0x4b;
  const isOle = header.length >= 8 && header.equals(OLE_SIGNATURE);
  if (!isZip && !isOle) {
    throw new BadRequestException('This file does not appear to be a valid Office document.');
  }
}
