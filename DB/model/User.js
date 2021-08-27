const Pg = require("../Postgres");
const Sequelize = Pg.Sequelize;
const sequelize = Pg.sequelize;
class User extends Sequelize.Model {}
User.init({
  // attributes
  id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement:true},
  email: Sequelize.STRING,
  password: Sequelize.STRING,
  fullname: Sequelize.STRING,
  telephone: Sequelize.STRING,
  rule: Sequelize.STRING
}, {
  sequelize,
  modelName: 'uzers',
  underscored: true,
  // options
});
module.exports = User;