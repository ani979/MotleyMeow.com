var City = require('./models/city.js');


City.distinct('name', function(err, cities) {
    console.log("Am i coming here, in the cities, length is " + cities.length);
    module.exports.cityArr = cities;
    //return cities;
});



