import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaHeartbeat,
  FaCalendarAlt,
  FaWeight,
  FaRulerVertical,
  FaMapMarkerAlt,
  FaChartLine,
  FaLightbulb,
  FaClock
} from "react-icons/fa";

import MainLayout from "../components/layout/MainLayout";
import api from "../services/api";

const formatUmur = (tanggalLahir) => {
  const lahir = new Date(tanggalLahir);
  const sekarang = new Date();

  let tahun = sekarang.getFullYear() - lahir.getFullYear();
  let bulan = sekarang.getMonth() - lahir.getMonth();
  let hari = sekarang.getDate() - lahir.getDate();

  if (hari < 0) {
    bulan--;
    const lastMonth = new Date(
      sekarang.getFullYear(),
      sekarang.getMonth(),
      0
    ).getDate();
    hari += lastMonth;
  }

  if (bulan < 0) {
    tahun--;
    bulan += 12;
  }

  return `${tahun} Tahun ${bulan} Bulan ${hari} Hari`;
};

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/analisis/${id}`);
        console.log(response.data.data);
        setData(response.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (!data) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h2 className="text-3xl font-bold">
            Data tidak ditemukan
          </h2>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-teal-600 font-semibold mb-8"
        >
          <FaArrowLeft />
          Kembali
        </button>

        <div className="bg-white rounded-[32px] shadow-xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-8 text-white">

            <div className="flex items-center gap-5">

              {data.foto_url ? (
                <img
                  src={`http://localhost:5000${data.foto_url}`}
                  alt={data.nama}
                  className="w-24 h-24 rounded-3xl object-cover border-4 border-white"
                />
              ) : (
                <div className="w-24 h-24 rounded-3xl bg-white text-teal-600 flex items-center justify-center text-4xl font-bold">
                  {data.nama.charAt(0)}
                </div>
              )}

              <div>
                <h1 className="text-4xl font-bold">
                  {data.nama}
                </h1>

                <p className="mt-2 opacity-90">
                  Laporan Hasil Analisis
                </p>
              </div>

            </div>

          </div>

          <div className="p-8">

            <div className="grid md:grid-cols-2 gap-5">

              <div className="bg-slate-50 rounded-2xl p-5">
                <FaCalendarAlt className="text-teal-500 mb-3" />
                <h3 className="font-semibold">Umur</h3>
                <p>{formatUmur(data.tanggal_lahir)}</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5">
                <FaWeight className="text-teal-500 mb-3" />
                <h3 className="font-semibold">Berat Badan</h3>
                <p>{data.berat_badan} Kg</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5">
                <FaRulerVertical className="text-teal-500 mb-3" />
                <h3 className="font-semibold">Tinggi Badan</h3>
                <p>{data.tinggi_badan} Cm</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5">
                <FaClock className="text-teal-500 mb-3" />
                <h3 className="font-semibold">Tanggal Analisis</h3>
                <p>
                {new Date(data.analyzed_at).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
              </div>

            </div>

            <div className="mt-8 bg-red-50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-red-600 mb-3">
                Status Deteksi
              </h2>

              <p className="text-lg">
                {data.status_stunting}
              </p>
            </div>

            <div className="mt-6 bg-white border border-cyan-100 rounded-3xl p-7 shadow-sm">

            <div className="flex items-center gap-3 mb-5">
              <FaChartLine className="text-cyan-600 text-2xl" />

              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Hasil Analisis AI
                </h2>

                <p className="text-sm text-slate-500">
                  Ringkasan hasil prediksi sistem
                </p>
              </div>
            </div>

            <div className="bg-cyan-50 rounded-2xl p-5 leading-8 text-slate-700">
              {data.tingkat_risiko_detail}
            </div>

          </div>

            <div className="mt-6 bg-teal-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <FaLightbulb className="text-teal-600" />
                <h2 className="text-xl font-bold">
                  Rekomendasi
                </h2>
              </div>

              <p>
                {data.rekomendasi}
              </p>
            </div>

            <div className="mt-6 border-l-4 border-yellow-500 bg-yellow-50 p-5 rounded-xl">
              <h3 className="font-bold mb-2">
                Catatan
              </h3>

              <p className="text-slate-600 leading-7">
                Hasil analisis ini merupakan prediksi berbasis Artificial Intelligence.
                Untuk diagnosis dan penanganan lebih lanjut, tetap disarankan
                melakukan konsultasi dengan tenaga kesehatan di Posyandu,
                Puskesmas, atau dokter spesialis anak.
              </p>
            </div>

          </div>

        </div>

      </motion.div>
    </MainLayout>
  );
};

export default Detail;