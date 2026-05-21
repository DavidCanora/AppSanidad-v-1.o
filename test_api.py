import requests
import json

url = "http://localhost:8000/api/v1/analyze"
file_path = "appSanidad/ejemplos_medicos/01_fractura_femur.png"

try:
    with open(file_path, "rb") as f:
        files = {"file": ("01_fractura_femur.png", f, "image/png")}
        data = {"format_type": "png"}
        response = requests.post(url, files=files, data=data)
        
    print("Status Code:", response.status_code)
    try:
        data = response.json()
        with open("response_output.json", "w", encoding="utf-8") as out:
            json.dump(data, out, ensure_ascii=False, indent=2)
        print("Wrote response to response_output.json")
    except Exception as je:
        print("Not JSON response. Error:", je)
        with open("response_output.txt", "w", encoding="utf-8") as out:
            out.write(response.text)
except Exception as e:
    print("Error:", e)
