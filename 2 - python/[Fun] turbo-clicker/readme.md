Turbo-clicker is useful for those times that you just need to click something a lot. The first issue I encountered after writing it was that, in spite of a sleep timer of 0, it just wasn't fast enough. I decided to make it multi-threaded, and it gave me an appreciation for the technique. Multi-threading is very powerful and it's the difference between 30 CPS and 30,000 CPS.

Pre-run commands (to install dependencies):

pip install pyautogui
pip install keyboard

To execute, run turbo-clicker.py

To adjust the speed of clicking, modify the following variables:

clicksPerCycle (for single, double, triple clicks, etc.)
clickInterval (the time between the first and second click in a double/triple click, etc)
cycleInterval (the time between two full single/double/triple clicks)
targetThreads (the amount of auto-clickers running at once. Scales to inhuman levels fast, so may require moderate values based on your application.)
