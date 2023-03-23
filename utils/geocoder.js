const { faker } = require('@faker-js/faker');


const getLongitudeLatitudeFromFakeZipCode = (zipcode) => {

    return {
        longitude: faker.address.longitude(),
        latitude: faker.address.latitude()
    }
}


module.exports = getLongitudeLatitudeFromFakeZipCode

