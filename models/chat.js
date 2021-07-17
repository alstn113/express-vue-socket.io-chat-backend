const Sequelize = require("sequelize");

module.exports = class Chat extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        chat: {
          type: Sequelize.STRING(200),
        },
        user: {
          type: Sequelize.STRING(150),
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "Chat",
        tableName: "chats",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Chat.belongsTo(db.Room, { foreignKey: "room_id", targetKey: "id", onDelete: "cascade" });
    db.Chat.belongsTo(db.User, { foreignKey: "user_id", targetKey: "id" });
  }
};
