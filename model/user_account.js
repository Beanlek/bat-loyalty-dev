module.exports = (sequelize,Sequelize)=> {
    var user_account = sequelize.define('user_account', {
       user_id:{
            type: Sequelize.TEXT,
            allowNull: false,
            primaryKey: true
        },
        outlet_id:{
            type: Sequelize.TEXT,
            allowNull: false,
            primaryKey: true
        },
        outlet_id:{
            type:Sequelize.TEXT
        },
        created_by:{
            type:Sequelize.TEXT,
            allowNull: false
        },
        created_at:{
            type:Sequelize.TEXT,
            allowNull: false
        },
        updated_by:{
            type:Sequelize.TEXT,
            allowNull: false
        },
        updated_at:{
            type:Sequelize.TEXT,
            allowNull: false
        }
    },{
        timestamps:true,
        underscored:true,
        freezeTableName:true
    }
    )
    return user_account;
}