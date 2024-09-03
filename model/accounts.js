module.exports = (sequelize,Sequelize)=> {
    var Accounts = sequelize.define('accounts',{ 
        id:{
            type: Sequelize.TEXT,
            allowNull: false, 
            primaryKey: true
        },
        name:{
            type: Sequelize.TEXT,
            allowNull: false
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
        }
    },{ 
        timestamps:true,
        underscored:true,
        freezeTableName:true
    })
    return Accounts; 
}     