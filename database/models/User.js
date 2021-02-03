const Sequelize = require('sequelize');
const connection = require('../connection');

const Users = connection.define('User', {
    userName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email:{
        type: Sequelize.STRING,
        allowNull: false
    },
    birthDate: {
        type: Sequelize.DATE,
        allowNull: false
    },
    group: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'default'
    }    
})

/* Sincroniza o modelo com a base de dados, não substituindo tabelas existentes */
Users.sync({force: false}).then(() => {
    /* Insere usuário de administração do WebGENTE caso não exista outro usuário*/
    connection.query('SELECT COUNT() AS count FROM Users') // Verifica se existem dados na base do WebGENTE
    .then(results => {
        if (results[0][0].count == 0) {
            console.log('Inserindo usuário de administração padrão do WebGENTE')
            Users.bulkCreate([{
                userName: 'admin' ,
                password: 'webgente',
                email: 'gente@ufv.br',
                birthDate: new Date(),
                group: 'admin',
                createdAt: new Date(),
                updatedAt: new Date()
            }])
        }
    });
})

module.exports = Users;