import { File } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";
import { ENV } from "./env";
import { supabase } from "./supabase";

export type Bucket = "product-images" | "delivery-proofs" | "refund-proofs";

export type FotoSiap = { uri: string; isi: ArrayBuffer; lebar: number; tinggi: number };

// Batas bucket di Supabase 2 MB (PRD 14.2). Foto dikecilkan jauh di bawahnya supaya hemat kuota di paket gratis.
const BATAS_BYTE = 2 * 1024 * 1024;
const LEBAR_MAKS = 1600;

async function bacaIsi(uri: string): Promise<ArrayBuffer> {
  if (Platform.OS === "web") return (await fetch(uri)).arrayBuffer();
  return new File(uri).arrayBuffer();
}

/**
 * Foto selalu digambar ulang lewat ImageManipulator dan disimpan sebagai WebP. Menggambar ulang
 * membuang metadata EXIF, termasuk lokasi GPS yang bisa menunjuk rumah pembeli atau admin.
 */
async function olah(uri: string, lebarAsli: number): Promise<FotoSiap> {
  const konteks = ImageManipulator.manipulate(uri, { maxWidth: LEBAR_MAKS * 2 });
  if (lebarAsli > LEBAR_MAKS) konteks.resize({ width: LEBAR_MAKS });
  const gambar = await konteks.renderAsync();

  for (const kualitas of [0.75, 0.55]) {
    const hasil = await gambar.saveAsync({ compress: kualitas, format: SaveFormat.WEBP });
    const isi = await bacaIsi(hasil.uri);
    if (isi.byteLength <= BATAS_BYTE) return { uri: hasil.uri, isi, lebar: hasil.width, tinggi: hasil.height };
  }
  throw new Error("Foto terlalu besar walau sudah dikompres. Coba foto lain.");
}

export type SumberFoto = "kamera" | "galeri";

/** null kalau admin membatalkan. Melempar Error berisi pesan yang bisa langsung ditampilkan. */
export async function pilihFoto(sumber: SumberFoto): Promise<FotoSiap | null> {
  const opsi: ImagePicker.ImagePickerOptions = { mediaTypes: "images", quality: 1, exif: false, allowsEditing: false };

  let hasil: ImagePicker.ImagePickerResult;
  if (sumber === "kamera") {
    const izin = await ImagePicker.requestCameraPermissionsAsync();
    if (!izin.granted) throw new Error("Izin kamera ditolak. Buka pengaturan HP untuk mengizinkan kamera.");
    hasil = await ImagePicker.launchCameraAsync(opsi);
  } else {
    hasil = await ImagePicker.launchImageLibraryAsync(opsi);
  }
  if (hasil.canceled || !hasil.assets[0]) return null;
  const aset = hasil.assets[0];
  return olah(aset.uri, aset.width);
}

export async function unggahFoto(bucket: Bucket, jalur: string, foto: FotoSiap): Promise<void> {
  const { error } = await supabase.storage.from(bucket).upload(jalur, foto.isi, {
    contentType: "image/webp",
    upsert: false,
  });
  if (error) throw error;
}

/** Nama file baru setiap unggah, jadi foto lama yang masih di cache web tidak tertukar. */
export function jalurFoto(folder: string): string {
  return `${folder}/${Date.now()}.webp`;
}

export function urlFotoProduk(jalur: string | null): string | null {
  if (!jalur) return null;
  return `${ENV.url}/storage/v1/object/public/product-images/${jalur.split("/").map(encodeURIComponent).join("/")}`;
}

/** Bucket bukti bersifat privat, jadi foto dibuka lewat link sementara yang berlaku 5 menit. */
export async function urlFotoPrivat(bucket: Exclude<Bucket, "product-images">, jalur: string): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(jalur, 300);
  if (error) throw error;
  return data.signedUrl;
}
