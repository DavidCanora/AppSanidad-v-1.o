import requests
import time

url = "http://localhost:8000/api/v1/analyze"
file_path = "appSanidad/ejemplos_medicos/01_fractura_femur.png"

try:
    start_time = time.time()
    with open(file_path, "rb") as f:
        files = {"file": ("01_fractura_femur.png", f, "image/png")}
        data = {"format_type": "png"}
        response = requests.post(url, files=files, data=data)
    elapsed = time.time() - start_time
    print(f"Status Code: {response.status_code}")
    print(f"Elapsed Time: {elapsed:.2f} seconds")
except Exception as e:
    print("Error:", e)
