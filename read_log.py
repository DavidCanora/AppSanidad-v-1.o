import os

log_path = r"C:\Users\david\.gemini\antigravity\brain\3d4af762-b09d-486e-a3be-5668189b3f14\.system_generated\tasks\task-766.log"

try:
    if os.path.exists(log_path):
        with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()
        tail = lines[-150:]
        with open("log_output.txt", "w", encoding="utf-8") as out:
            out.writelines(tail)
        print("Success, wrote tail of log to log_output.txt")
    else:
        print("Log file not found at path:", log_path)
except Exception as e:
    print("Error reading log:", e)
