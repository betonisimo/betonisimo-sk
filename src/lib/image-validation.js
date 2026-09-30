export async function validateImageFile(file) {
  if (!file || typeof file.arrayBuffer !== "function" || !file.size) throw new Error("Vyberte fotografiu.");
  if (file.size > 3 * 1024 * 1024) throw new Error("Obrázok je príliš veľký. Maximum sú 3 MB po kompresii.");
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((byte, i) => bytes[i] === byte);
  const webp = String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  const extension = jpeg ? "jpg" : png ? "png" : webp ? "webp" : "";
  const mime = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" }[extension];
  if (!mime || file.type !== mime) throw new Error("Povolené sú iba skutočné fotografie JPG, PNG a WebP.");
  return extension;
}
