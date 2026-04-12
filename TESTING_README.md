# Automated Game Testing Script

This script automatically opens multiple Chrome browsers and joins players to a Codenames game for testing purposes.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements_test.txt
```

2. Download ChromeDriver:
   - Go to https://chromedriver.chromium.org/downloads
   - Download the version that matches your Chrome browser
   - Place chromedriver.exe in your PATH or in the project directory

3. Make sure the game server is running:
```bash
docker-compose up
```

## Usage

Run the script:
```bash
python test_game.py
```

This will:
- Open 5 Chrome windows
- Create a Codenames room with CaptainAlex
- Join 4 players to the room
- Keep browsers open until you press Enter in each terminal

## Notes

- The script uses threading to run multiple browsers simultaneously
- Captain creates the room first, then players join after a delay
- Each browser stays open until you manually close it
- Make sure no other Chrome instances are running to avoid conflicts