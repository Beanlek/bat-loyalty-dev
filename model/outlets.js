module.exports = (sequelize,Sequelize)=> {
    var Outlets = sequelize.define('outlets', {
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
        account_id:{
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
    return Outlets;
}