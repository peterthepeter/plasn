export function getCssLabelTextTransform(
  textRotationDeg: number,
  textScaleX: number,
): string {
  return `translate(-50%, -50%) rotate(${textRotationDeg}deg) scaleX(${textScaleX})`;
}

export function getPdfLabelTextRotationDeg(textRotationDeg: number): number {
  return textRotationDeg === 0 ? 0 : -textRotationDeg;
}
