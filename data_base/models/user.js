const Model = require("../model");
const pool = require('../db');

class User extends Model {
    constructor(login = null, password = null, name = null, email = null, id = null) {
        super('users');
        this.ID = id;
        this.name = name;
        this.login = login;
        this.email = email;
        this.password = password;
    }
    find(id) {
        if(id != null)
            return super.find(id);
        else {
            return pool.execute(`SELECT ID FROM ${this.table} WHERE login='${this.login}'`)
                .then((res) =>{
                    if(res[0].length > 0)
                        return super.find(res[0][0]['ID']);
                    else
                        return "NOT FOUND";
                });
        }
    }
    delete() {
        super.delete();
    }
    save() {
        if(this.ID == null) {
            //INSERT
            return pool.execute(`INSERT INTO users
            (login, password, name, email) 
            VALUES('${this.login}', '${this.password}', 
                '${this.name}', '${this.email}')`)

                .then(res => {
                    this.ID = res[0].insertId;
                    console.log("INSERTED");
                })
                .catch(err => {
                    console.error(err.message);
                    return err;
                });
        }
        else {
            //UPDATE
            return pool.execute(`UPDATE users SET 
            name='${this.name}',
            login='${this.login}',
            password='${this.password}',
            email='${this.email}'
            WHERE ID=${this.ID} `)

                .then(res => {
                    console.log("UPDATED");
                })
                .catch(err => {
                    console.error(err);
                    return err;
                });
        }
    }
}

module.exports = User;
