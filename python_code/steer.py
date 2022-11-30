import RPi.GPIO as GPIO

out1 = 18
out2 = 16
sequency = 50

class Steer(object):
    def __init__(self) -> None:
        GPIO.setmode(GPIO.BOARD)
        GPIO.setup(out1, GPIO.OUT)
        GPIO.setup(out2, GPIO.OUT)
        self.x_servo = GPIO.PWM(out1, sequency)
        self.y_servo  = GPIO.PWM(out2, sequency)
        self.x_servo.start(7.5)
        self.y_servo.start(7.5)
        self.x_servo.ChangeDutyCycle(0)
        self.y_servo.ChangeDutyCycle(0)
        self.x_duty = 50
        self.y_duty = 50
    
    def move(self, orient, duty):
        servo = self.x_servo if orient == -1 else self.y_servo
        if duty < 0:
            # 停止
            servo.ChangeDutyCycle(0)
        else:
            if orient == -1:
                self.x_duty = duty
            else:
                self.y_duty = duty
            parse_duty = 2.5 + (duty/10)
            servo.ChangeDutyCycle(parse_duty)
    
    def destroy(self):
        self.x_servo.stop()
        self.y_servo.stop()
