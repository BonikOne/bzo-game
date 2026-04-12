import pyautogui
import time

time.sleep(5)  # 5 секунд чтобы ты успел переключиться в консоль

text = """
sudo docker volume prune
"""

for line in text.split("\n"):
    pyautogui.typewrite(line)
    pyautogui.press("enter")
    time.sleep(0.5)


