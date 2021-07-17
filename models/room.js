const Sequelize = require("sequelize");

module.exports = class Room extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        title: {
          type: Sequelize.STRING(200),
          allowNull: false,
        },
        max: {
          type: Sequelize.INTEGER(1),
          default: 4,
          validate: {
            min: 2,
            max: 9,
          },
        },
        password: {
          type: Sequelize.STRING(150),
        },
        owner: {
          type: Sequelize.STRING(150),
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "Room",
        tableName: "rooms",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Room.hasMany(db.Chat, { foreignKey: "room_id", sourceKey: "id" });
  }
};
