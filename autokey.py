import pyautogui
import time

time.sleep(5)  # 5 секунд чтобы ты успел переключиться в консоль

text = """
sudo certbot certonly --standalone -d friend-games.ru -d www.friend-games.ru --agree-tos --email onebonik@gmail.com --non-interactive
"""

for line in text.split("\n"):
    pyautogui.typewrite(line)
    pyautogui.press("enter")
    time.sleep(0.5)



