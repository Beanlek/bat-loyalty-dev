module.exports = (sequelize, Sequelize) => {
    var Receipt_image = sequelize.define('receipt_image', { 
        id:{
            type: Sequelize.UUID,
            allowNull: false,
            primaryKey: true
        }, 
        date:{ 
            type: Sequelize.DATE, 
            allowNull: false
        }, 
        user_id: { 
            type: Sequelize.TEXT, 
            allowNull: false
        }, 
        outlet_id: { 
            type: Sequelize.TEXT, 
            allowNull: false
        }, 
        image: { 
            type: Sequelize.TEXT, 
            allowNull: false
        }, 
        image_ocr: { 
            type: Sequelize.TEXT, 
            allowNull: false
        }, 
        status: { 
            type: Sequelize.TEXT, 
            allowNull: false
        }, 
        image_points: { 
            type: Sequelize.TEXT, 
            allowNull: false
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
    return Receipt_image;
}