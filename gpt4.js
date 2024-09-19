const axios = require("axios");

/**
 * Diambil Oleh Kaviaann
 * Dilindungi oleh LISENSI MIT
 * Siapa pun yang ketahuan menghapus wm akan dituntut
 * @description Ada permintaan? Hubungi saya: vielynian@gmail.com
 * @penulis Kaviaann 2024
 * @hak cipta https://whatsapp.com/channel/0029Vac0YNgAjPXNKPXCvE2e
 */
function gpt4(prompt) {
    return new Promise((resolve, reject) => {
        (function () {
            try {
                const token = Math.random().toString(32).substring(2);
                const d = process.hrtime();
                
                // PETUNJUK PENDAFTARAN
                axios.post("https://thobuiq-gpt-4o.hf.space/run/predict?__theme=light", {
                    data: [{ teks: prompt, file: [] }],
                    data_peristiwa: null,
                    indeks_fn: 3,
                    sesi_hash: token,
                    pemicu_id: 18,
                    headers: {
                        Origin: "https://thobuiq-gpt-4o.hf.space",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/127.0.0.0 Safari/537.36",
                    },
                });

                // BERGABUNG
                axios.post("https://thobuiq-gpt-4o.hf.space/queue/join?__theme=light", {
                    data: [null, null, "idefics2-8b-chatty", "Greedy", 0.7, 4096, 1, 0.9],
                    data_peristiwa: null,
                    indeks_fn: 5,
                    sesi_hash: token,
                    pemicu_id: 18,
                    headers: {
                        Origin: "https://thobuiq-gpt-4o.hf.space",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/127.0.0.0 Safari/537.36",
                    },
                });

                // TANGANI HASIL
                const stream = axios.get("https://thobuiq-gpt-4o.hf.space/queue/data?" +
                    new URLSearchParams({
                        sesi_hash: token,
                    }), {
                    headers: {
                        Accept: "text/event-stream",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/127.0.0.0 Safari/537.36",
                    },
                    responseType: "stream",
                });

                stream.data.on("data", (chunk) => {
                    const data = JSON.parse(chunk.toString().split("data: ")[1]);
                    if (data.msg === "process_completed") {
                        const end = process.hrtime(d);
                        const result = data.output.data[0][0][1] || "";
                        if (!result) return reject("Gagal mendapat respons");
                        resolve({
                            prompt,
                            response: result,
                            duration: end[0] + " s",
                        });
                    }
                });
            } catch (e) {
                reject(e);
            }
        })();
    });
}

module.exports = gpt4;