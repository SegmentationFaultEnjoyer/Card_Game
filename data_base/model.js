const mysql = require('./db.js')

module.exports = class Model {
    constructor(table) {
        this.table = table;
    }
    async find(data) {
        let con = await mysql();
        con.connect();
        try {
            let conditions = [];
            for (let key in data) {
                if (key !== "id") {
                    conditions.push(`${key}='${data[key]}'`);
                } else {
                    conditions.push(`${key}=${data[key]}`)
                }
            }
            let str = "";
            for (let i = 0; i < conditions.length; i++) {
                if (i == conditions.length - 1) {
                    str += conditions[i];
                } else {
                    str += conditions[i] + ` AND `;
                }
            }
            const [rows, fields] = await con.promise().query(`SELECT * FROM ${this.table} WHERE ${str}`);
            
            con.end();
            return rows;
        } catch (e) {
            con.end();
            return [false];
        }
    }
    async findByParam(param, data) {
        let con = await mysql();
        con.connect();
        try {
            let conditions = [];
            for (let key in data) {
                if (key !== "id") {
                    conditions.push(`${key}='${data[key]}'`);
                } else {
                    conditions.push(`${key}=${data[key]}`)
                }
            }
            let str = "";
            for (let i = 0; i < conditions.length; i++) {
                if (i == conditions.length - 1) {
                    str += conditions[i];
                } else {
                    str += conditions[i] + ` AND `;
                }
            }
            const [rows, fields] = await con.promise().query(`SELECT ${param} FROM ${this.table} WHERE ${str}`);
            
            con.end();
            return rows;
        } catch (e) {
            con.end();
            throw e;
        }
    }
    async delete(id) {
        let con = await mysql();
        con.connect();
        try {
            const [rows, fields] = await con.promise().query(`DELETE FROM ${this.table} WHERE id = ${id}`);
            con.end();
        } catch (e) {
            console.log(e);
            con.end();
        }
    }

    async getAll(){
        let con = await mysql();
        con.connect();
        try {
            const [rows, fields] = await con.promise().query(`SELECT * FROM ${this.table};`);
            con.end();
            return rows;
        } catch (e) {
            console.log(e);
            con.end();
            return false;
        }
    }
    
    async save(data) {
        let keys = [];
        let con = await mysql();
        con.connect();
        if (data.id) {
            let update = [];
            for (let key in data) {
                if (key !== "id") {
                    keys.push(key);
                    update.push(`${key}='${data[key]}'`);
                }
            }

            try {
                const resp = await con.promise().query(`UPDATE ${this.table} SET ${update} WHERE id=${data.id};`);
                con.end();
            } catch (e) {
                console.log(e);
                con.end();
                return false;
            }
        } else {
            let values = [];
            for (let key in data) {
                if (key !== "id") {
                    keys.push(key);
                    values.push(`'${data[key]}'`);
                }
            }
            try {
                const resp = await con.promise().query(`INSERT INTO ${this.table} (${keys}) VALUES (${values})`);
                con.end();
            } catch (e) {
                console.log(e)
                con.end();
                return false;
            }
        }
        return true

    }


}
