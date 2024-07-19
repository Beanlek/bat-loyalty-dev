module.exports = (sequelize, Sequelize) => {
  var Users = sequelize.define('users', {
    id:{
      type: Sequelize.TEXT,
      allowNull: false,
      primaryKey: true
    },
    name:{
      type: Sequelize.TEXT,
      allowNull: false
    },
    password:{
      type: Sequelize.TEXT,
      allowNull: false
    },
    active:{
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    address1:{
      type: Sequelize.TEXT,
      allowNull: true
    },
    address2:{
      type: Sequelize.TEXT,
      allowNull: true
    },
    address3:{
      type: Sequelize.TEXT,
      allowNull: true
    },
    postcode:{
      type: Sequelize.TEXT,
      allowNull: true
    },
    city:{
      type: Sequelize.TEXT,
      allowNull: true
    },
    state:{
      type: Sequelize.TEXT,
      allowNull: true
    },
    email:{
      type: Sequelize.TEXT,
      allowNull: true
    },
    mobile:{
      type: Sequelize.TEXT,
      allowNull: true
    },
    last_login_at:{
      type: Sequelize.DATE,
      allowNull: true
    },
    user_type:{
      type: Sequelize.TEXT,
      allowNull: false
    },
    security_image:{
      type: Sequelize.TEXT,
      allowNull: true
    },
    security_phrase:{
      type: Sequelize.TEXT,
      allowNull: true
    },

    created_by: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false
    },
    updated_by: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: true
    },

    session_id: {
      type: Sequelize.TEXT,
      allowNull: true
    }
  },{
    timestamps: true,
    underscored: true,
    freezeTableName: true
  });
  return Users;
}
