# Import libraries
import RPi.GPIO as GPIO
import time

# Set GPIO numbering mode
GPIO.setmode(GPIO.BOARD)
# Set pin 11 as an output, and set servo1 as pin 11 as PWM
GPIO.setup(22, GPIO.OUT)
servo1 = GPIO.PWM(22, 50) # Note 11 is pin, 50 = 50Hz pulse

def deg2duty(deg):
    degrees = 2.5+deg*10/180
    return degrees

#start PWM running, but with value of 0 (pulse off)
# servo1.ChangeDutyCycle(deg2duty(-45))
servo1.start(1.35)
time.sleep(2)
servo1.ChangeDutyCycle(11.35)
time.sleep(2)
servo1.ChangeDutyCycle(1.35)
time.sleep(2)
GPIO.cleanup()