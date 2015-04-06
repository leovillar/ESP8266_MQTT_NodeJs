//MIT License 2015 Leo Villar
//https://github.com/leovillar/ESP8266_MQTT_NodeJs

'use strict';

var app = angular.module('App', ['ngMaterial', 'btford.socket-io'])

var options = {};
options = {};
options.base_url = "http://192.168.1.118:3000";
options.soketio = 'http://192.168.1.118:5001';

app.factory('socket', function(socketFactory) {
    return socketFactory({
      ioSocket: io.connect(options.soketio)
    });

});

app.controller('AppController', ['$http', '$scope', 'socket', function($http, $scope, socket, $mdToast, $animate) {

	$scope.socketStatus = "Estado Sin conexion";

    $http.get(options.base_url + '/switches').success(function(data){
    	$scope.ctrls = [];
        $scope.ctrls = data;
    }).error(function(data, status) {
        console.log(status);
    });

	$scope.$on('socket:error', function (ev, data) {
		$scope.socketStatus = "Estado Sin conexion";
    });

	socket.on('disconnect', function(){
	    $scope.socketStatus = "Estado Sin conexion";
	    var ctrls = $scope.ctrls;
        for (var ctrlkey in ctrls) {
            $scope.ctrls[ctrlkey].enabled = true;
        }
	});
	
	socket.on('connect', function(){
	    var ctrls = $scope.ctrls;
        for (var ctrlkey in ctrls) {
            socket.emit('subscribe', {topic: String(ctrls[ctrlkey].name)});
            $scope.ctrls[ctrlkey].enabled = false;
        }
        $scope.socketStatus = "Estado Conectado";
	});				

   	socket.on('mqtt', function (msg) {
		console.log(msg);
		$scope.socketStatus = 'Estado Conectado';
	    var ctrls = $scope.ctrls;

        for (var ctrlkey in ctrls) {
            if (ctrls[ctrlkey].name == msg.topic){
            	$scope.ctrls[ctrlkey].state = eval(msg.message);
            	break;
            }
        }
	});
	
	$scope.onChange = function(device, valor){
		 emitSocketPub(device, valor);
  	};

	function emitSocketPub (device, valor) {
		if ($scope.socketStatus == 'Estado Conectado'){
			socket.emit('publish', {topic: String(device), message: String(valor)});
		}
	};

}]);

