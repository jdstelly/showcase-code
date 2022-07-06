# FUNCTION DEFINITIONS
import pyautogui as regBot
import time
import os
import tkinter as tk

# Allow clipboard read
# root = tk.Tk()
# root.withdraw()

# Allow clipboard write
def addToClipBoard(text):
    command = "echo " + text.strip() + "| clip"
    os.system(command)

def clickImage(image, region = (0, 0, 1920, 1080)):
    regBot.click(regBot.locateCenterOnScreen(image, region = region, confidence = 0.9), duration=0.25)

def moveToImage(image, region = (0, 0, 1920, 1080)):
    regBot.moveTo(regBot.locateCenterOnScreen(image, region = region, confidence = 0.9), duration=0.25)

def picoPause():
    time.sleep(0.01)

def tickPause():
    time.sleep(0.1)

def briefPause():
    time.sleep(0.5)

def shortPause():
    time.sleep(1)

def pause():
    time.sleep(2)

def longPause():
    time.sleep(4)

def moveMouse(x, y):
    regBot.moveRel(x, y, duration=0.25)

def moveMouseTo(x, y):
    regBot.moveTo(x, y, duration=0.25)

def clickDrag(x, y):
    regBot.dragTo(x, y, duration=0.5)

def scroll(x):
    regBot.scroll(x)

def click():
    regBot.click()

def rightClick():
    regBot.rightClick()

def typeIn(text):
    regBot.typewrite(text, interval=0.01)

def pressKey(key):
    regBot.press(key)

def hotKey2(key1, key2):
    regBot.hotkey(key1, key2)

def hotKey3(key1, key2, key3):
    regBot.hotkey(key1, key2, key3)

def altF4():
    print("Closing page..")
    regBot.keyDown('alt')
    regBot.keyDown('f4')
    regBot.keyUp('f4')
    regBot.keyUp('alt')

def searchFor(image, name, region = (0, 0, 1920, 1080)):
    currentCycle = 0
    while str(regBot.locateCenterOnScreen(image, region = region, confidence=0.9)).lower() == 'none':
            print(f'Searching for ' + name + ".. (" + str(currentCycle + 1) + ")")
            time.sleep(1)
            currentCycle += 1

    print('Found ' + name + "! Continuing..")
    return 'found'

def searchForOnce(image, name, region = (0, 0, 1920, 1080)):
    result = str(regBot.locateCenterOnScreen(image, region = region, confidence=0.9)).lower()
    print(result)
    if (result != 'none'):
        print(f'Found {name}!')
        return 'found'
    else:
        print(f'Did not find {name}')
        return 'none'

def searchForOptional(image, cycles, name, region = (0, 0, 1920, 1080)):
    currentCycle = 1
    while str(regBot.locateCenterOnScreen(image, region = region, confidence=0.9)).lower() == 'none' and currentCycle <= cycles:
            print('Searching for ' + name + ".. (" + str(currentCycle) + "/" + str(cycles) + ")")
            time.sleep(1)
            currentCycle += 1

    if currentCycle > cycles:
        print('Did not find ' + name + "! Continuing..")
        return 'not found'

    if currentCycle <= cycles:
        print('Found ' + name + "! Continuing..")
        return 'found'

def searchForTwo(image1, image2, name):
    currentCycle = 0
    while str(regBot.locateCenterOnScreen(image1, confidence = 0.8)).lower() == 'none' and str(regBot.locateCenterOnScreen(image2, confidence = 0.8)).lower() == 'none':
            print('Searching for ' + name + "..(" + str(currentCycle) + ")")
            time.sleep(1)
            currentCycle += 1

    print('Found ' + name + "! Continuing..")

    if (str(regBot.locateCenterOnScreen(image1, confidence = 0.8)).lower() != 'none'):
        return 'pic1'

    if (str(regBot.locateCenterOnScreen(image2, confidence = 0.8)).lower() != 'none'):
        return 'pic2'

    return 'not found'

def searchForTwoOptional(image1, image2, cycles, name):
    currentCycle = 0
    image1Result = 'none'
    image2Result = 'none'

    while image1Result == 'none' and image2Result == 'none' and currentCycle <= cycles:
        image1Result = str(regBot.locateCenterOnScreen(image1, confidence=0.8)).lower()
        image2Result = str(regBot.locateCenterOnScreen(image2, confidence=0.8)).lower()
        print('Searching for ' + name + ".. (" + str(currentCycle) + "/" + str(cycles) + ")")
        time.sleep(1)
        currentCycle += 1

    if currentCycle > cycles:
        print('Did not find ' + name + "! Continuing..")
        return 'not found'

    if currentCycle <= cycles:
        if image1Result != 'none':
            print("Found Image 1!")
            return 'pic1'
        elif image2Result != 'none':
            print("Found image 2!")
            return 'pic2'
        else:
            print("ERROR - Loop ended before cycles, but neither image was found.")
            return 'error'

def findImageCoordinates(image, cycles, region = (0, 0, 1920, 1080)):
    print("Performing image search request for " + str(image) + "")
    currentCycle = 1
    result = 'none'
    while result == 'none' and currentCycle <= cycles:
            print("Searching for image.. (" + str(currentCycle) + "/" + str(cycles) + ")")
            result = str(regBot.locateCenterOnScreen(image, region = region, confidence=0.98)).lower()
            time.sleep(1)
            currentCycle += 1

    if currentCycle > cycles:
        print("Did not find coordinates!")
        return 'none'

    if currentCycle <= cycles:
        print("Found coordinates at " + result + "!")
        return result