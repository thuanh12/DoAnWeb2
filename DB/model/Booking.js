const Pg = require("../Postgres");
const User = require("./User");
const ShowTime = require("./ShowTime");
const Sequelize = Pg.Sequelize;
const sequelize = Pg.sequelize;
class Booking extends Sequelize.Model {}
Booking.init({
  // attributes
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement:true},
  timeofbooking: Sequelize.TIME,
  price: Sequelize.FLOAT,
  horizontaladdress: Sequelize.STRING,
  verticaladdress: Sequelize.STRING
}, {
  sequelize,
  modelName: 'bookings',
  underscored: true,
  // options
});
Booking.belongsTo(User);
User.hasMany(Booking);

Booking.belongsTo(ShowTime);
ShowTime.hasMany(Booking);
module.exports = Booking;
