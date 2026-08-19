// Uploads an image file directly to Cloudinary using an unsigned upload
// preset, and returns the hosted image URL. No backend or secret key
// needed — the preset controls what's allowed (see Cloudinary dashboard
// -> Settings -> Upload -> Upload presets -> "recipehub").

const CLOUD_NAME = "eldt26ea";
const UPLOAD_PRESET = "recipehub";

export async function uploadImageToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new Error(
      errBody?.error?.message || "Image upload failed. Please try again."
    );
  }

  const data = await res.json();
  return data.secure_url;
}
