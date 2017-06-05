how to power on bluetooth (default is powered off)

1. rfkill list <--- default is bluetooth is soft-blocked
2. rfkill unblock bluetooth <-- to unblock it
3. bluetoothctl
4. power on
5. ctrl+D to quit

rfkill block wifi
rfkill unblock bluetooth
hciconfig hci0 up/down
bluetoothctl
power on
discoverable yes
agent on
default-agent
connect [MAC ADDRESS]

