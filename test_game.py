import time
import threading
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def setup_driver():
    """Create a Chrome driver instance"""
    options = Options()
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    return webdriver.Chrome(options=options)

def play_game(driver, player_name, is_captain=False):
    """Automate joining a game for one player"""
    try:
        # Navigate to the game
        driver.get("http://localhost:3000")

        # Wait for page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "nicknameInput"))
        )

        # Enter nickname
        nickname_input = driver.find_element(By.ID, "nicknameInput")
        nickname_input.clear()
        nickname_input.send_keys(player_name)

        # Click login
        login_btn = driver.find_element(By.ID, "loginBtn")
        login_btn.click()

        # Wait for game selection
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "game-card"))
        )

        # Select Codenames
        codenames_card = driver.find_element(By.ID, "codenames-card")
        codenames_card.click()

        # Wait for room list
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "createRoomBtn"))
        )

        if is_captain:
            # Create room
            create_btn = driver.find_element(By.ID, "createRoomBtn")
            create_btn.click()
            print(f"Captain {player_name} created room")
        else:
            # Wait a bit for room to be created, then refresh and join
            time.sleep(3)
            driver.refresh()

            # Wait for room list again
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "room-item"))
            )

            # Join first available room
            rooms = driver.find_elements(By.CLASS_NAME, "room-item")
            if rooms:
                join_btn = rooms[0].find_element(By.CLASS_NAME, "join-room-btn")
                join_btn.click()
                print(f"Player {player_name} joined room")

        # Keep browser open
        input(f"Press Enter to close {player_name}'s browser...")

    except Exception as e:
        print(f"Error with {player_name}: {e}")
    finally:
        driver.quit()

def main():
    """Main function to start multiple players"""
    players = [
        ("CaptainAlex", True),
        ("Player1", False),
        ("Player2", False),
        ("Player3", False),
        ("Player4", False)
    ]

    threads = []

    for player_name, is_captain in players:
        thread = threading.Thread(target=play_game, args=(setup_driver(), player_name, is_captain))
        threads.append(thread)
        thread.start()
        time.sleep(1)  # Stagger the starts

    # Wait for all threads to complete
    for thread in threads:
        thread.join()

if __name__ == "__main__":
    print("Starting automated game testing...")
    print("Make sure the server is running on http://localhost:3000")
    print("And ChromeDriver is installed")
    main()