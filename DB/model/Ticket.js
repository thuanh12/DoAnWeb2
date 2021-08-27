const Pg = require("../Postgres");
const Sequelize = Pg.Sequelize;
const sequelize = Pg.sequelize;
const Booking = require("../model/Booking");
class Ticket extends Sequelize.Model {}
Ticket.init({
  // attributes
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement:true},
  seatcode: Sequelize.STRING,
  horizontaladdress: Sequelize.STRING,
  verticaladdress: Sequelize.STRING,
  price: Sequelize.FLOAT
}, {
  sequelize,
  modelName: 'tickets',
  underscored: true,
  // options
});
Booking.hasMany(Ticket);
Ticket.belongsTo(Booking);
module.exports = Ticket;
