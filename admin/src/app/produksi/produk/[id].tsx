import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { AksiFoto } from "@/components/AksiFoto";
import { Isian } from "@/components/Isian";
import { Bagian, Catatan } from "@/components/Kartu";
import { IsiKeadaan, Kosong } from "@/components/Keadaan";
import { Layar } from "@/components/Layar";
import { Pilihan } from "@/components/Pilihan";
import { Saklar } from "@/components/Saklar";
import { Tombol } from "@/components/Tombol";
import { jalurFoto, unggahFoto, urlFotoProduk, type FotoSiap } from "@/lib/foto";
import { bacaAngka } from "@/lib/format";
import { pesanGalat } from "@/lib/galat";
import type { BarisProduk } from "@/lib/jenis";
import { KATEGORI, SATUAN } from "@/lib/label";
import { useMuat, wajib } from "@/lib/muat";
import { supabase } from "@/lib/supabase";
import { segarkanWeb } from "@/lib/web";

type Kategori = (typeof KATEGORI)[number]["kode"];
type Satuan = (typeof SATUAN)[number]["kode"];
type Kolom = "nama" | "slug" | "kategori" | "satuan" | "harga" | "beratIsi" | "beratKemas" | "urutan";

const POLA_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function keSlug(nama: string): string {
  return nama
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function UbahProduk() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const baru = id === "baru";
  const { keadaan, ulangi } = useMuat(
    async () => (baru ? null : wajib(await supabase.from("products").select("*").eq("id", id).maybeSingle())),
  );

  return (
    <Layar>
      <Stack.Screen options={{ title: baru ? "Produk baru" : "Ubah produk" }} />
      <IsiKeadaan keadaan={keadaan} ulangi={ulangi}>
        {(p) => (!baru && !p ? <Kosong judul="Produk tidak ditemukan" /> : <FormProduk produk={p} />)}
      </IsiKeadaan>
    </Layar>
  );
}

function FormProduk({ produk }: { produk: BarisProduk | null }) {
  const [nama, setNama] = useState(produk?.name ?? "");
  const [slug, setSlug] = useState(produk?.slug ?? "");
  const [slugDiketik, setSlugDiketik] = useState(!!produk);
  const [kategori, setKategori] = useState<Kategori | null>((produk?.category as Kategori) ?? null);
  const [satuan, setSatuan] = useState<Satuan | null>((produk?.unit_type as Satuan) ?? null);
  const [deskripsi, setDeskripsi] = useState(produk?.description ?? "");
  const [harga, setHarga] = useState(produk?.price != null ? String(produk.price) : "");
  const [beratIsi, setBeratIsi] = useState(produk?.net_weight_gram != null ? String(produk.net_weight_gram) : "");
  const [beratKemas, setBeratKemas] = useState(produk?.ship_weight_gram != null ? String(produk.ship_weight_gram) : "");
  const [urutan, setUrutan] = useState(String(produk?.sort_order ?? 0));
  const [aktif, setAktif] = useState(produk?.is_active ?? false);
  const [foto, setFoto] = useState<FotoSiap | null>(null);
  const [galat, setGalat] = useState<Partial<Record<Kolom, string>>>({});
  const [galatUmum, setGalatUmum] = useState<string | null>(null);
  const [memproses, setMemproses] = useState(false);

  function isi(ubah: (t: string) => void, k: Kolom) {
    return (t: string) => {
      ubah(t);
      setGalat((lama) => {
        const baru = { ...lama };
        delete baru[k];
        return baru;
      });
    };
  }

  function ubahNama(t: string) {
    isi(setNama, "nama")(t);
    // Slug mengikuti nama sampai admin mengetiknya sendiri. Produk lama tidak ikut berubah supaya link lama tetap jalan.
    if (!slugDiketik) setSlug(keSlug(t));
  }

  async function simpan() {
    const g: Partial<Record<Kolom, string>> = {};
    const nilaiHarga = bacaAngka(harga);
    const nilaiIsi = bacaAngka(beratIsi);
    const nilaiKemas = bacaAngka(beratKemas);
    const nilaiUrutan = bacaAngka(urutan);

    if (nama.trim().length < 2 || nama.trim().length > 120) g.nama = "Nama produk 2 sampai 120 huruf.";
    if (!POLA_SLUG.test(slug)) g.slug = "Huruf kecil, angka, dan tanda hubung saja, mis. bandeng-asap.";
    if (!kategori) g.kategori = "Pilih kategori.";
    if (!satuan) g.satuan = "Pilih satuan.";
    if (harga.trim() && (nilaiHarga === null || nilaiHarga <= 0)) g.harga = "Harga berupa angka rupiah, mis. 45000.";
    if (beratIsi.trim() && (nilaiIsi === null || nilaiIsi <= 0)) g.beratIsi = "Berat isi dalam gram, mis. 250.";
    if (beratKemas.trim() && (nilaiKemas === null || nilaiKemas <= 0)) g.beratKemas = "Berat kemas dalam gram, mis. 300.";
    if (nilaiIsi !== null && nilaiKemas !== null && nilaiKemas < nilaiIsi) g.beratKemas = "Berat kemas tidak boleh lebih kecil dari berat isi.";
    if (aktif) {
      if (nilaiHarga === null) g.harga = "Produk aktif wajib punya harga.";
      if (nilaiIsi === null) g.beratIsi = "Produk aktif wajib punya berat isi.";
      if (nilaiKemas === null) g.beratKemas = "Produk aktif wajib punya berat kemas.";
    }
    if (nilaiUrutan === null || !Number.isInteger(nilaiUrutan)) g.urutan = "Urutan berupa angka bulat.";

    setGalat(g);
    if (Object.keys(g).length > 0) {
      setGalatUmum("Periksa lagi isian yang ditandai merah.");
      return;
    }
    setGalatUmum(null);
    setMemproses(true);
    try {
      let image_path = produk?.image_path ?? null;
      if (foto) {
        image_path = jalurFoto(slug);
        await unggahFoto("product-images", image_path, foto);
      }
      const data = {
        name: nama.trim(),
        slug,
        category: kategori!,
        unit_type: satuan!,
        description: deskripsi.trim(),
        price: nilaiHarga,
        net_weight_gram: nilaiIsi,
        ship_weight_gram: nilaiKemas,
        sort_order: nilaiUrutan!,
        is_active: aktif,
        image_path,
      };
      const { error } = produk
        ? await supabase.from("products").update(data).eq("id", produk.id)
        : await supabase.from("products").insert(data);
      if (error) throw error;
      await segarkanWeb("katalog");
      router.back();
    } catch (e) {
      setGalatUmum(pesanGalat(e));
    } finally {
      setMemproses(false);
    }
  }

  return (
    <>
      <Bagian judul="Identitas">
        <Isian label="Nama produk" nilai={nama} ubah={ubahNama} galat={galat.nama} placeholder="Bandeng asap" />
        <Isian
          label="Slug (alamat halaman produk)"
          nilai={slug}
          ubah={(t) => {
            setSlugDiketik(true);
            isi(setSlug, "slug")(t.toLowerCase());
          }}
          autoCapitalize="none"
          galat={galat.slug}
          petunjuk={`Halaman produk: /produk/${slug || "..."}. Mengubah slug produk lama membuat link yang sudah dibagikan tidak jalan.`}
        />
        <Pilihan label="Kategori" opsi={KATEGORI} nilai={kategori} ubah={setKategori} galat={galat.kategori} />
        <Pilihan label="Satuan jual" opsi={SATUAN} nilai={satuan} ubah={setSatuan} galat={galat.satuan} />
        <Isian label="Deskripsi" nilai={deskripsi} ubah={setDeskripsi} multiline placeholder="Rasa, cara masak, atau isi kemasan" petunjuk="Jangan menulis klaim kesehatan atau angka gizi tanpa hasil uji lab produk sendiri." />
      </Bagian>

      <Bagian judul="Harga dan berat">
        <Isian label="Harga" akhiran="rupiah" keyboardType="number-pad" nilai={harga} ubah={isi(setHarga, "harga")} galat={galat.harga} petunjuk="Harga baru berlaku untuk checkout berikutnya. Pesanan yang sudah dibuat tetap memakai harga lama." />
        <Isian label="Berat isi" akhiran="gram" keyboardType="number-pad" nilai={beratIsi} ubah={isi(setBeratIsi, "beratIsi")} galat={galat.beratIsi} petunjuk="Ditampilkan ke pembeli." />
        <Isian label="Berat setelah dikemas" akhiran="gram" keyboardType="number-pad" nilai={beratKemas} ubah={isi(setBeratKemas, "beratKemas")} galat={galat.beratKemas} petunjuk="Dipakai menghitung kapasitas cool box." />
      </Bagian>

      <Bagian judul="Foto">
        <AksiFoto label="Foto produk" foto={foto} ubah={setFoto} urlLama={urlFotoProduk(produk?.image_path ?? null)} keterangan="Dikecilkan dan dikompres di HP sebelum diunggah. Lokasi GPS di foto ikut terhapus." />
      </Bagian>

      <Bagian judul="Tampilan">
        <Isian label="Urutan di katalog" keyboardType="number-pad" nilai={urutan} ubah={isi(setUrutan, "urutan")} galat={galat.urutan} petunjuk="Angka kecil tampil lebih dulu." />
        <Saklar label="Tampil di web" keterangan="Nonaktifkan untuk menyembunyikan produk tanpa menghapusnya." nilai={aktif} ubah={setAktif} />
      </Bagian>

      {galatUmum && <Catatan nada="merah">{galatUmum}</Catatan>}
      <Tombol label={produk ? "Simpan produk" : "Tambah produk"} onPress={simpan} memproses={memproses} />
    </>
  );
}
