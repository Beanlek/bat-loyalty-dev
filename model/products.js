module.exports = (sequelize, Sequelize) => {
    var Products = sequelize.define('products', {
      id:{
        type: Sequelize.TEXT,
        allowNull: false,
        primaryKey: true
      },
      name:{
        type: Sequelize.TEXT,
        allowNull: false
      },
      brand:{
        type: Sequelize.TEXT,
        allowNull: true
      },
      image:{
        type: Sequelize.BLOB,
        allowNull: true
      },
      points:{
        type: Sequelize.INTEGER,
        defaultValue: 0, 
        allowNull: true
      },
      active:{
        type: Sequelize.BOOLEAN,
        defaultValue: true, 
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
      }
    },{
      timestamps: true,
      underscored: true,
      freezeTableName: true
    });
    return Products;
  }
  