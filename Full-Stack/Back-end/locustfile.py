import random
from locust import HttpUser, task, between


class SIDIASUser(HttpUser):

    wait_time = between(1, 3)

    # data balita yang tersedia
    data_ids = [
        "555afd2a-65bd-4bf3-8a26-8b3b2dfdbde6",
        "3b8c7a6e-2599-4969-82f6-d7697ee63299"
    ]

    # hasil analisis yang sudah pernah dibuat
    analisis_ids = [
        "b80b3e36-de88-436c-8085-585fc2f8f0a2",
        "832c7ca3-c0ee-4060-8d82-487947ac2164"
    ]


    def on_start(self):

        # Login mendapatkan token JWT
        response = self.client.post(
            "/api/auth/login",
            json={
                "nik": "1234567890123458",
                "password": "12345"
            }
        )

        print("LOGIN STATUS:", response.status_code)

        if response.status_code == 200:
            token = response.json()["token"]

            self.client.headers.update({
                "Authorization": f"Bearer {token}"
            })

        else:
            print("LOGIN ERROR:", response.text)



    # Pengambilan data balita
    @task(3)
    def get_data_balita(self):

        response = self.client.get(
            "/api/data-balita"
        )

        print("DATA BALITA:", response.status_code)



    # Melihat hasil analisis yang sudah ada
    @task(2)
    def get_detail_analisis(self):

        analisis_id = random.choice(self.analisis_ids)

        response = self.client.get(
            f"/api/analisis/{analisis_id}"
        )

        print("DETAIL ANALISIS:", response.status_code)



    # Proses AI diagnosis
    # dibuat lebih kecil karena proses ini menghasilkan data baru
    @task(1)
    def analisis(self):

        data_id = random.choice(self.data_ids)

        with self.client.post(
            "/api/analisis",
            json={
                "data_id": data_id
            },
            catch_response=True
        ) as response:

            print("ANALISIS STATUS:", response.status_code)

            if response.status_code in [200, 201]:
                response.success()

            elif "Analisis untuk data balita ini sudah ada" in response.text:
                # bukan error sistem, hanya validasi duplikasi
                response.success()

            else:
                response.failure(response.text)