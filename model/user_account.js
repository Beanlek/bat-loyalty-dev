const db = require('../model/db.js');

module.exports = (sequelize, Sequelize) => {
  var User_account = sequelize.define('user_account', {
    user_id:{
      type: Sequelize.TEXT,
      allowNull: false,
    },
    outlet_id:{
      type: Sequelize.TEXT,
      allowNull: false,
      references: {
        model: 'outlets',
        key: 'id'
      }
    },
    
    active:{
      type: Sequelize.BOOLEAN, 
      defaultValue: true
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
  },{
    timestamps: true,
    underscored: true,
    freezeTableName: true
  });

  User_account.removeAttribute('id');
  
  return User_account;
}