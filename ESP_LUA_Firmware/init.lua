-- MIT License 2015 Leo Villar
-- https://github.com/leovillar/ESP8266_MQTT_NodeJs

local pinO = 3  --> GPIO0
local pinI = 4  --> GPIO2
local state = ''
local setstate = ''

local value = gpio.HIGH
gpio.mode(pinO, gpio.OUTPUT)
gpio.write(pinO, value)

wifi.setmode(wifi.STATION)
wifi.sta.config("ssid","pws")

port = 1883
host = "iot.eclipse.org"

function onChangeSwitch ()
    print('The pin value has changed to '..gpio.read(pinI))
    if state == 'false' then
        setstate = 'true'
    else
        setstate = 'false'
    end
    m:publish("switch1",setstate,1,1, function(conn) end)
end

gpio.mode(pinI, gpio.INT)
gpio.write(pinI, gpio.LOW)
gpio.trig(pinI, 'both', onChangeSwitch)

function switchLED (estado)
  if estado == 'true' then
    value = gpio.LOW
  else
    value = gpio.HIGH
  end
  gpio.write(pinO, value)
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
  print(topic .. ":" ..data ) 
  if data ~= nil then
    state = data
    switchLED(data)
  end
end)

tmr.alarm(0, 1000, 1, function()
  if wifi.sta.status() == 5 then
    tmr.stop(0)
    m:connect(host, port, 0, function(conn)
      print("connectado")
      m:subscribe("switch1",0, function(conn) print("Subcripcion ok switch1")
      end)
    end)
  end
end)
