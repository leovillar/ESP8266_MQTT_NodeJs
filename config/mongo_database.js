var mongoose = require('mongoose');
var mongodbURL = 'mongodb://localhost/ESPMQTTSwitches';
var mongodbOptions = { };

mongoose.connect(mongodbURL, mongodbOptions, function (err, res) {
    if (err) { 
        console.log('No se pudo conectar a ' + mongodbURL);
        console.log(err);
    } else {
        console.log('Coneccion OK a ' + mongodbURL);
    }
});

var Schema = mongoose.Schema;

var Switch = new Schema({
    type: { type: String, required: true },
    name: { type: String, required: true },
    label: { type: String, required: true },
    state: { type: Boolean},
    enabled: { type: Boolean}
});

//Definicion Modelo
var switchModel = mongoose.model('Switch', Switch);

// Exports Modelo
exports.switchModel = switchModel;

//Populate si es la primera que corre.
switchModel.findOne({ name: 'switch1' }, function(err, result) {
    if (err) {
        return console.error(err);
    };
    if (result == null){
        var newSwitch = switchModel({
            type: 'switch',
            name: 'switch1',
            label: 'Switch 1',
            state: false,
            enabled: true
        });

        newSwitch.save(function(err) {
            if (err) throw err;
            console.log('Switch creado!');
        });
    };
});