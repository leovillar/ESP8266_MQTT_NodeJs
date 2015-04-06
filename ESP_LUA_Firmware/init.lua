-- MIT License 2015 Leo Villar
-- https://github.com/leovillar/ESP8266_MQTT_NodeJs

pin = 4  --> GPIO2
local value = gpio.LOW
gpio.mode(pin, gpio.OUTPUT)
gpio.write(pin, value)

wifi.setmode(wifi.STATION)
wifi.sta.config("ssid","pws")

port = 1883
host = "iot.eclipse.org"
--host = "192.168.1.142"

function switchLED (estado)
  if estado == 'true' then
    value = gpio.HIGH
  else
    value = gpio.LOW
  end
  gpio.write(pin, value)
end

m = mqtt.Client("ESP8266_"..node.chipid(), 120, "", "")
m:lwt("switch1", "false", 1, 1)

m:on("offline", function(con) 
  print ("reconectando...") 
  tmr.alarm(1, 10000, 0, function()
  m:connect(host, port, 0)
  end)
end)

m:on("message", function(conn, topic, data) 
  print(topic .. ":" ) 
  if data ~= nil then
    print(data)
    switchLED(data)
  end
end)

tmr.alarm(0, 1000, 1, function()
  if wifi.sta.status() == 5 then
    tmr.stop(0)
    m:connect(host, port, 0, function(conn)
      print("conectado")
      m:subscribe("switch1",0, function(conn) print("Subcripcion ok switch1")
      end)
    end)
  end
end)
