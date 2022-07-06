from common_functions import *
import pyautogui as clickBot
import random, keyboard, threading, time, math

global active
active = False
anchored = False
lastKeyPress = 'nil'
clickArea = 'nil'
clicksPerCycle = 1 # clicks per cycle
clickInterval = 0 # pause between clicks in seconds
cycleInterval = .1 # pause between cycles in seconds
activeThreads = 0
targetThreads = 3 # desired number of threads
threads = {}
startTime = 0
elapsedTime = 0
maxTime = 420 # Max session timeout - automatically ends clicker after this many seconds
deltaX = 0
deltaY = 0

# CLICKER CLASS DEFINITION
class thread_with_exception(threading.Thread): 
    def __init__(self, name): 
        threading.Thread.__init__(self) 
        self.name = name

    def run(self): 
        while True: 
            print(f"Thread '{self.name}' is running..")
            mouseX, mouseY = clickBot.position()
            clickBot.click(                
                clickArea.x,
                clickArea.y,
                clicksPerCycle,
                clickInterval + random.randint(0, 500)/1000
            )
            time.sleep(cycleInterval)
            deltaX = abs(mouseX - clickBot.position().x)
            deltaY = abs(mouseY - clickBot.position().y)
            if deltaX or deltaY > 100:
                print("Detected mouse movement! Cancelling finger blaster..")
                global active
                active = False
            if active == False:
                print(f"Thread '{self.name}' is shutting down..")
                del threads[self.name]
                try:
                    self.join()
                except:
                    print("Thread terminated, one way or another.")


    def get_id(self): 
        if hasattr(self, '_thread_id'): 
            return self._thread_id 
        for id, thread in threading._active.items(): 
            if thread is self: 
                return id

while True:
    try:
        # ACTIVATION
        if keyboard.is_pressed('o'):
            active = True
        #print(f"Active threads: {len(threads)}")

        # ACTIVE CYCLE
        if (active):
            print(f"Cycle is active..({elapsedTime}/{maxTime} seconds remaining.)")

            # ANCHOR MOUSE
            if not anchored:
                clickArea = clickBot.position()
                startTime = math.floor(time.time())
                anchored = True

            # GENERATE THREADS
            if (activeThreads < targetThreads):
                print("Spawning threads")
                for i in range (targetThreads):
                    print(f"Generating 'thread{i}'..")
                    activeThreads += 1
                    threads[f"thread{i}"] = thread_with_exception(f"thread{i}")
                    threads[f"thread{i}"].start()
                    time.sleep(.10)
                
            # DEACTIVATION
            if keyboard.is_pressed('k'):
                active = False

            # MAX TIME WATCHDOG
            if (elapsedTime > maxTime):
                active = False
            else:
                elapsedTime += 1
            
            time.sleep(1)
        
        # DORMANT CYCLE
        else:
            print("Cycle is inactive. Place mouse over target and press and hold 'o' to start. Press and hold 'k' to stop. Close this window to quit.")
            shortPause()
            anchored = False
            active = False
            activeThreads = 0
            elapsedTime = 0
    
    # GENERIC ERROR CATCH
    except:
        print("Something wrong happened that cycle. Oops.")
