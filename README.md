# Automatic Door Opener

Author: Mohd Naim bin Inche Ibrahim

E-mail: mohdnaim@gmail.com

Final Year Project - BS Computer Science (Information Systems) 2017

The complete system uses the following: Intel Galileo Gen1, Linux (Yocto), C++, HTML5, CSS, Bootstrap, JavaScript, NodeJS, SocketIO, Android, Wi-Fi, Bluetooth, Bash, XML

## Poster
![](/images/poster.png)

## System Overview
![](/images/systemoverview.png)

Both the mobile phone and Intel Galileo have Wi-Fi and Bluetooth modules to communicate to each other via a Wi-Fi access point. Wi-Fi and Bluetooth modules compensate one another in case one is missing or not functioning in user’s mobile phone. The Galileo board can read the status of the motor (door) either the door is opened or closed and display the information to the user via a user interface. The user can control the motor (door) via mobile app that acts as a ‘wrapper’ to the user interface provided by the Intel Galileo board. The microcontroller board controls the motor via board circuit.

## Use Case Diagram
![](/images/usecasediagram.png)

There are two types of system user: user and administrator (admin). A user is able to do all the use cases in the above diagram with exception of two uses cases: add user and delete user which are doable only for admin.

## Context Diagram
![](/images/context-diagram.png)

A user can toggle the button to open and close the door. The application displays the current status of the door either opened or closed and system information such as the Wi-Fi and Local Area Network (LAN) Internet Protocol (IP) addresses on the user interface. The LCD module displays the status of the door. It also displays the Wi-Fi IP address of the system in case the IP is changed since the last time the user accessed the system. 
Wi-Fi and Bluetooth modules enable wireless communication between the system and its users. PIR Sensor senses the surrounding motion and reports the status in every interval with pre-determined duration. The motor performs the open and close door operation based on the action from the user. 

## Level-0 Data Flow Diagram
![](/images/level0dataflowdiagram.png)

The level-0 data flow diagram shows one entity which is the system user (normal user and admin), interacting with the automatic door opener system by user interface. There are four main processes of the system: authenticate user, add/delete user, open/close door, display system status and display door status. 

## Breadboard View

![](/images/breadboardview.png)
1.	Intel Galileo Gen 1 board – 1x
2.	1602A LCD module – 1x
3.	HC-05 ZS-040 Bluetooth module – 1x
4.	TowerPro MG90S Servo – 1x
5.	PIR Sensor – 1x	6.	10kΩ Potentiometer – 1x
7.	LED – 2x
8.	220Ω Resistor – 2x
9.	100Ω Resistor – 1x
10.	Breadboard – 1x

## Screenshots
![](/images/ss-1.png)

![](/images/ss-2.png)

![](/images/ss-3.png)

![](/images/ss-4.png)

![](/images/ss-5.png)

![](/images/ss-6.png)

![](/images/ss-7.png)

![](/images/ss-8.png)

![](/images/ss-9.png)

![](/images/ss-10.png)

![](/images/ss-11.png)
