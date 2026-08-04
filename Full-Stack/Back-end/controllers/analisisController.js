import { pool } from '../config/db.js';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

function calculateFusion(rfResult, mnResult) {

    const rfWeight = rfResult.confidence * 0.7;
    const mnWeight = mnResult.confidence * 0.3;

    const finalScore = rfWeight + mnWeight;

    // Default mengikuti hasil Random Forest
    let status_stunting = rfResult.status_stunting;
    let tingkat_risiko = rfResult.tingkat_risiko;
    let status_detail = rfResult.status_detail;
    let tingkat_risiko_detail = rfResult.tingkat_risiko_detail;
    let rekomendasi = rfResult.rekomendasi;
    let rekomendasi_detail = rfResult.rekomendasi_detail;
    let indikator = "WHO Antropometri + Visual (MobileNetV2)";

    let indikator_detail =
    `Antropometri: ${rfResult.indikator_detail}
    Visual: ${mnResult.indikator} - ${mnResult.status_stunting}
    (Confidence: ${(mnResult.confidence * 100).toFixed(2)}%)`;

    let z_score = rfResult.z_score;

    let model_version = "Ensemble (Random Forest + MobileNetV2)";

    // Jika Random Forest mendeteksi stunting,
    // hasil akhir tetap Stunting
    if (rfResult.status_stunting === "Terindikasi Stunting") {
        status_stunting = "Terindikasi Stunting";
        tingkat_risiko = "Tinggi";

        status_detail =
            "Hasil analisis antropometri menunjukkan anak terindikasi mengalami stunting. Analisis visual digunakan sebagai informasi pendukung.";

        tingkat_risiko_detail =
            "Anak memiliki risiko tinggi mengalami stunting sehingga diperlukan evaluasi dan penanganan lebih lanjut.";

        rekomendasi =
            "Segera konsultasikan ke fasilitas kesehatan, lakukan evaluasi status gizi, serta penuhi kebutuhan nutrisi anak.";

        rekomendasi_detail =
            "Lakukan pemeriksaan rutin di posyandu atau dokter anak, tingkatkan konsumsi protein, vitamin, dan makanan bergizi seimbang.";

    }

    // Jika Random Forest Tidak Stunting
    // tetapi MobileNet mendeteksi Stunting,
    // menggunakan threshold confidence
   else if (
        rfResult.status_stunting === "Tidak Stunting" &&
        mnResult.status_stunting === "Terindikasi Stunting"
    ) {

        if (finalScore >= 0.75) {

            status_stunting = "Terindikasi Stunting";
            tingkat_risiko = "Tinggi";

            status_detail =
                "Analisis gabungan antropometri dan citra menunjukkan indikasi stunting.";

            tingkat_risiko_detail =
                "Risiko stunting tinggi berdasarkan kombinasi kedua model.";

            rekomendasi =
                "Segera lakukan pemeriksaan lanjutan ke fasilitas kesehatan.";

            rekomendasi_detail =
                "Lakukan evaluasi status gizi dan pemantauan pertumbuhan secara berkala.";

        } else {

            status_stunting = "Tidak Stunting";
            tingkat_risiko = "Rendah";

            status_detail =
                "Data antropometri menunjukkan pertumbuhan anak masih normal.";

            tingkat_risiko_detail =
                "Risiko stunting masih rendah berdasarkan hasil gabungan.";

            rekomendasi =
                "Pertahankan pola makan bergizi seimbang.";

            rekomendasi_detail =
                "Lanjutkan pemantauan pertumbuhan setiap bulan.";

        }

    }

    // Jika MobileNet hanya mendeteksi Malnutrisi,
    // diagnosis tetap mengikuti Random Forest
    else if (
        mnResult.status_stunting === "Terindikasi Malnutrisi"
    ) {

        status_stunting = rfResult.status_stunting;
        tingkat_risiko = "Sedang";

        status_detail =
            "Data antropometri menunjukkan pertumbuhan anak masih normal, namun analisis citra mendeteksi indikasi malnutrisi sehingga kondisi gizi perlu mendapat perhatian.";

        tingkat_risiko_detail =
            "Risiko stunting berada pada kategori sedang karena ditemukan indikasi malnutrisi dari analisis visual meskipun hasil antropometri masih normal.";

        rekomendasi =
            "Perbaiki kualitas asupan gizi, tingkatkan konsumsi protein dan vitamin, serta lakukan pemantauan pertumbuhan secara berkala.";

        rekomendasi_detail =
            "Disarankan melakukan evaluasi pola makan dan pemeriksaan status gizi apabila kondisi tidak membaik.";


    }

    return {
        rfWeight,
        mnWeight,
        finalScore,

        status_stunting,
        status_detail,

        tingkat_risiko,
        tingkat_risiko_detail,

        indikator,
        indikator_detail,

        z_score,

        rekomendasi,
        rekomendasi_detail,

        model_version
    };

}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to run the Python AI script
const runAIPrediction = (umur_bulan, jenis_kelamin, tinggi_badan, berat_badan) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../AI/predict.py');
    const command = `python "${scriptPath}" ${umur_bulan} "${jenis_kelamin}" ${tinggi_badan} ${berat_badan}`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`AI execution error: ${error.message || stderr}`));
      }
      try {
        const result = JSON.parse(stdout.trim());
        if (result.error) {
          return reject(new Error(result.error));
        }
        resolve(result);
      } catch (e) {
        reject(new Error(`Gagal memparsing output AI: ${stdout}`));
      }
    });
  });
};

// Helper function to run the MobileNetV2 image AI script
const runImageAIPrediction = (fotoPath) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../AI/predict_mobilenet.py');
    const command = `python "${scriptPath}" "${fotoPath}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`AI execution error: ${error.message || stderr}`));
      }
      try {
        const result = JSON.parse(stdout.trim());
        if (result.error) {
          return reject(new Error(result.error));
        }
        resolve(result);
      } catch (e) {
        reject(new Error(`Gagal memparsing output AI: ${stdout}`));
      }
    });
  });
};

// ... existing code ... (but we are replacing from line 1 onwards up to line 188)
// Wait, we need to output the rest of the functions from line 1 to 188 in this replacement block.
// Let's do that.
// Let's keep the get/all methods as they were.

// Mengambil semua data analisis (Admin mendapat semua, User hanya yang ia buat)
export const getAllAnalisis = async (req, res, next) => {
  try {
    let result;
    if (req.user.role === 'admin') {
      result = await pool.query(`
        SELECT a.*, 
               db.nama, 
               db.jenis_kelamin, 
               db.tanggal_lahir, 
               db.berat_badan, 
               db.tinggi_badan, 
               db.umur_bulan, 
               db.foto_url, 
               db.created_by
        FROM analisis a
        JOIN data_balita db ON a.data_id = db.id
        ORDER BY a.analyzed_at DESC
      `);
    } else {
      result = await pool.query(`
        SELECT a.*, 
               db.nama, 
               db.jenis_kelamin, 
               db.tanggal_lahir, 
               db.berat_badan, 
               db.tinggi_badan, 
               db.umur_bulan, 
               db.foto_url, 
               db.created_by
        FROM analisis a
        JOIN data_balita db ON a.data_id = db.id
        WHERE db.created_by = $1
        ORDER BY a.analyzed_at DESC
      `, [req.user.nik]);
    }
    res.status(200).json({
      success: true,
      count: result.rowCount,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Mengambil data analisis berdasarkan ID
export const getAnalisisById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let result;

    if (req.user.role === "admin") {
      result = await pool.query(
        `
        SELECT
          a.*,
          db.nama,
          db.jenis_kelamin,
          db.tanggal_lahir,
          db.umur_bulan,
          db.berat_badan,
          db.tinggi_badan,
          db.foto_url,
          db.created_by
        FROM analisis a
        JOIN data_balita db
          ON a.data_id = db.id
        WHERE a.id = $1
        `,
        [id]
      );
    } else {
      result = await pool.query(
        `
        SELECT
          a.*,
          db.nama,
          db.jenis_kelamin,
          db.tanggal_lahir,
          db.umur_bulan,
          db.berat_badan,
          db.tinggi_badan,
          db.foto_url,
          db.created_by
        FROM analisis a
        JOIN data_balita db
          ON a.data_id = db.id
        WHERE a.id = $1
          AND db.created_by = $2
        `,
        [id, req.user.nik]
      );
    }

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Data analisis tidak ditemukan atau Anda tidak memiliki akses",
      });
    }

    console.log("HASIL QUERY:", result.rows[0]);
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// Mengambil analisis berdasarkan ID balita
export const getAnalisisByDataId = async (req, res, next) => {
  try {
    const { data_id } = req.params;
    let result;
    if (req.user.role === 'admin') {
      result = await pool.query('SELECT * FROM analisis WHERE data_id = $1 ORDER BY analyzed_at DESC', [data_id]);
    } else {
      result = await pool.query(`
        SELECT a.* 
        FROM analisis a
        JOIN data_balita db ON a.data_id = db.id
        WHERE a.data_id = $1 AND db.created_by = $2 
        ORDER BY a.analyzed_at DESC
      `, [data_id, req.user.nik]);
    }

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data analisis untuk balita ini tidak ditemukan atau Anda tidak memiliki akses'
      });
    }

    // Biasanya kita mengembalikan data yang paling baru
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Menambahkan data analisis baru
export const createAnalisis = async (req, res, next) => {
  try {
    const { data_id } = req.body;

    if (!data_id) {
      return res.status(400).json({
        success: false,
        message: 'Field data_id wajib diisi'
      });
    }

    // Memastikan data balita ada dan milik user (jika bukan admin)
    let balitaRes;
    if (req.user.role === 'admin') {
      balitaRes = await pool.query('SELECT * FROM data_balita WHERE id = $1', [data_id]);
    } else {
      balitaRes = await pool.query('SELECT * FROM data_balita WHERE id = $1 AND created_by = $2', [data_id, req.user.nik]);
    }

    if (balitaRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data balita tidak ditemukan atau Anda tidak memiliki akses'
      });
    }

    // Memastikan analisis untuk balita belum ada (jika relasinya 1-to-1)
    const existingAnalisis = await pool.query('SELECT id FROM analisis WHERE data_id = $1', [data_id]);
    if (existingAnalisis.rowCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Analisis untuk data balita ini sudah ada'
      });
    }

    const balita = balitaRes.rows[0];
    const { umur_bulan, jenis_kelamin, tinggi_badan, berat_badan, foto_url } = balita;

    // Jalankan prediksi model AI
    // Jika foto_url tersedia, jalankan keduanya (Random Forest & MobileNetV2) secara paralel.
    // Jika tidak ada foto, jalankan hanya Random Forest.
    let status_stunting,
        status_detail,
        tingkat_risiko,
        tingkat_risiko_detail,
        indikator,
        indikator_detail,
        z_score,
        rekomendasi,
        rekomendasi_detail,
        model_version;

    try {
      if (foto_url) {
        const cleanFotoUrl = foto_url.startsWith('/') ? foto_url.slice(1) : foto_url;
        const fotoPath = path.join(__dirname, '..', cleanFotoUrl);

        // Jalankan kedua AI secara paralel
        const [rfResult, mnResult] = await Promise.all([
          runAIPrediction(umur_bulan, jenis_kelamin, tinggi_badan, berat_badan),
          runImageAIPrediction(fotoPath)
        ]);

        console.log("Random Forest:", rfResult);
        console.log("MobileNet:", mnResult);

        const fusionResult = calculateFusion(rfResult, mnResult);
        console.log("Fusion Result:", fusionResult);

        // Menggunakan seluruh hasil Fusion
        status_stunting = fusionResult.status_stunting;
        status_detail = fusionResult.status_detail;
        tingkat_risiko = fusionResult.tingkat_risiko;
        tingkat_risiko_detail = fusionResult.tingkat_risiko_detail;
        indikator = fusionResult.indikator;
        indikator_detail = fusionResult.indikator_detail;
        z_score = fusionResult.z_score;
        rekomendasi = fusionResult.rekomendasi;
        rekomendasi_detail = fusionResult.rekomendasi_detail;
        model_version = fusionResult.model_version;

      } else {
        // Hanya jalankan Random Forest
        const rfResult = await runAIPrediction(umur_bulan, jenis_kelamin, tinggi_badan, berat_badan);
        
        status_stunting = rfResult.status_stunting;
        status_detail = rfResult.status_detail;
        tingkat_risiko = rfResult.tingkat_risiko;
        tingkat_risiko_detail = rfResult.tingkat_risiko_detail;
        indikator = rfResult.indikator;
        indikator_detail = rfResult.indikator_detail;
        z_score = rfResult.z_score;
        rekomendasi = rfResult.rekomendasi;
        rekomendasi_detail = rfResult.rekomendasi_detail;
        model_version = 'Random Forest';
      }
    } catch (aiError) {
      return res.status(500).json({
        success: false,
        message: `Gagal menjalankan prediksi AI: ${aiError.message}`
      });
    }

    // Mencegah numeric field overflow pada kolom z_score DECIMAL(4,2)
    let parsedZScore = parseFloat(z_score);
    if (isNaN(parsedZScore)) {
      parsedZScore = 0.00;
    } else {
      parsedZScore = Math.max(-99.99, Math.min(99.99, parsedZScore));
    }

    const result = await pool.query(
      `INSERT INTO analisis (data_id, status_stunting, status_detail, tingkat_risiko, tingkat_risiko_detail, indikator, indikator_detail, z_score, rekomendasi, rekomendasi_detail, model_version) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        data_id, 
        status_stunting, 
        status_detail || null,
        tingkat_risiko || null, 
        tingkat_risiko_detail || null,
        indikator || null, 
        indikator_detail || null,
        parsedZScore, 
        rekomendasi || null,
        rekomendasi_detail || null,
        model_version
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Data analisis berhasil ditambahkan menggunakan AI',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Memperbarui data analisis berdasarkan ID
export const updateAnalisis = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      status_stunting, 
      status_detail,
      tingkat_risiko, 
      tingkat_risiko_detail,
      indikator, 
      indikator_detail,
      z_score, 
      rekomendasi,
      rekomendasi_detail
    } = req.body;

    // Cek kepemilikan
    const checkRes = await pool.query(`
      SELECT a.*, db.created_by 
      FROM analisis a
      JOIN data_balita db ON a.data_id = db.id
      WHERE a.id = $1
    `, [id]);

    if (checkRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data analisis tidak ditemukan'
      });
    }

    if (req.user.role !== 'admin' && checkRes.rows[0].created_by !== req.user.nik) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Ini bukan data analisis balita Anda.'
      });
    }

    const result = await pool.query(
      `UPDATE analisis 
       SET status_stunting = COALESCE($1, status_stunting),
           status_detail = COALESCE($2, status_detail),
           tingkat_risiko = COALESCE($3, tingkat_risiko),
           tingkat_risiko_detail = COALESCE($4, tingkat_risiko_detail),
           indikator = COALESCE($5, indikator),
           indikator_detail = COALESCE($6, indikator_detail),
           z_score = COALESCE($7, z_score),
           rekomendasi = COALESCE($8, rekomendasi),
           rekomendasi_detail = COALESCE($9, rekomendasi_detail)
       WHERE id = $10 RETURNING *`,
      [
        status_stunting, 
        status_detail,
        tingkat_risiko, 
        tingkat_risiko_detail,
        indikator, 
        indikator_detail,
        z_score, 
        rekomendasi, 
        rekomendasi_detail,
        id
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Data analisis berhasil diperbarui',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Menghapus data analisis berdasarkan ID
export const deleteAnalisis = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Cek kepemilikan
    const checkRes = await pool.query(`
      SELECT a.id, db.created_by 
      FROM analisis a
      JOIN data_balita db ON a.data_id = db.id
      WHERE a.id = $1
    `, [id]);

    if (checkRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data analisis tidak ditemukan'
      });
    }

    const ownerNik = checkRes.rows[0].created_by ? String(checkRes.rows[0].created_by).trim() : null;
    const userNik = req.user.nik ? String(req.user.nik).trim() : null;

    console.log(`[DeleteAnalisis] ID: ${id}, Role: ${req.user.role}, Owner NIK: '${ownerNik}', User NIK: '${userNik}'`);

    if (req.user.role !== 'admin' && ownerNik !== userNik) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Ini bukan data analisis balita Anda. (Owner: ${ownerNik}, Anda: ${userNik})`
      });
    }

    const result = await pool.query('DELETE FROM analisis WHERE id = $1 RETURNING *', [id]);

    res.status(200).json({
      success: true,
      message: 'Data analisis berhasil dihapus',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
