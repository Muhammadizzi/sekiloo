"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

// Pin berupa elemen HTML, bukan gambar bawaan Leaflet yang sering gagal dimuat lewat bundler.
const IKON_PIN = L.divIcon({
  className: "",
  html: '<span class="bg-gold-700 shadow-raised block size-7 rotate-45 rounded-[50%_50%_0_50%] border-2 border-white"></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 34],
});

const ZOOM_AWAL = 16;

/**
 * Peta Leaflet + OpenStreetMap, hanya dimuat di halaman checkout (PRD Bagian 19.1).
 * Pin baru muncul setelah pembeli mengetuk peta, supaya titik tengah kecamatan tidak dikira lokasi rumahnya.
 */
export default function PetaPin({
  pusat,
  titik,
  onPilih,
  idDeskripsi,
}: {
  pusat: [number, number];
  titik: [number, number] | null;
  onPilih: (lat: number, lng: number) => void;
  idDeskripsi?: string;
}) {
  const wadah = useRef<HTMLDivElement>(null);
  const peta = useRef<L.Map | null>(null);
  const pin = useRef<L.Marker | null>(null);
  const nilaiAwal = useRef({ pusat, titik });
  const pemanggil = useRef(onPilih);
  const [mencari, setMencari] = useState(false);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);

  useEffect(() => {
    pemanggil.current = onPilih;
  }, [onPilih]);

  useEffect(() => {
    if (!wadah.current) return;
    const awal = nilaiAwal.current;
    const p = L.map(wadah.current, { center: awal.titik ?? awal.pusat, zoom: ZOOM_AWAL, scrollWheelZoom: false });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(p);

    const m = L.marker(awal.titik ?? awal.pusat, { draggable: true, icon: IKON_PIN, keyboard: false });
    m.on("dragend", () => {
      const posisi = m.getLatLng();
      pemanggil.current(posisi.lat, posisi.lng);
    });
    if (awal.titik) m.addTo(p);
    p.on("click", (e: L.LeafletMouseEvent) => pemanggil.current(e.latlng.lat, e.latlng.lng));

    peta.current = p;
    pin.current = m;
    return () => {
      p.remove();
      peta.current = null;
      pin.current = null;
    };
  }, []);

  // Ganti kecamatan sebelum pin dipasang: peta ikut pindah ke kecamatan itu.
  useEffect(() => {
    if (!titik) peta.current?.setView(pusat, ZOOM_AWAL);
  }, [pusat, titik]);

  useEffect(() => {
    const p = peta.current;
    const m = pin.current;
    if (!p || !m || !titik) return;
    m.setLatLng(titik);
    if (!p.hasLayer(m)) m.addTo(p);
  }, [titik]);

  function pakaiLokasiku() {
    if (!("geolocation" in navigator)) {
      setPesanLokasi("Browser ini tidak bisa mencari lokasi. Ketuk lokasi rumahmu di peta.");
      return;
    }
    setMencari(true);
    setPesanLokasi(null);
    navigator.geolocation.getCurrentPosition(
      (posisi) => {
        setMencari(false);
        const { latitude, longitude } = posisi.coords;
        pemanggil.current(latitude, longitude);
        peta.current?.setView([latitude, longitude], 17);
      },
      (galat) => {
        setMencari(false);
        setPesanLokasi(
          galat.code === galat.PERMISSION_DENIED
            ? "Izin lokasi ditolak. Ketuk lokasi rumahmu di peta saja."
            : "Lokasi belum ketemu. Ketuk lokasi rumahmu di peta.",
        );
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  function taruhDiTengah() {
    const tengah = peta.current?.getCenter();
    if (tengah) pemanggil.current(tengah.lat, tengah.lng);
  }

  return (
    <div>
      <div className="border-line relative isolate overflow-hidden rounded-lg border">
        <div
          ref={wadah}
          aria-label="Peta lokasi antar. Ketuk peta untuk menaruh pin, atau geser peta dengan tombol panah lalu pakai tombol taruh pin di tengah peta."
          aria-describedby={idDeskripsi}
          className="h-72 w-full md:h-80"
        />
        {!titik && (
          <p className="bg-ink-900/85 text-on-dark pointer-events-none absolute top-3 left-1/2 z-[1000] -translate-x-1/2 rounded-md px-3 py-1.5 text-sm whitespace-nowrap">
            Ketuk lokasi rumahmu di peta
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="outline" loading={mencari} onClick={pakaiLokasiku}>
          {mencari ? "Mencari lokasi…" : "Pakai lokasiku sekarang"}
        </Button>
        <Button type="button" variant="ghost" onClick={taruhDiTengah}>
          Taruh pin di tengah peta
        </Button>
      </div>
      {pesanLokasi && (
        <p role="status" className="text-content-soft mt-2 text-sm">
          {pesanLokasi}
        </p>
      )}
    </div>
  );
}
