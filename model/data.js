var Mock = require('mockjs')
// 生成随机数据
var Random = Mock.Random
module.exports = {
    _data: {
        // 刚开始有一批测试数据，真实后端开发是不存在这些测试数据的，这些测试数据需要在浏览器中通过注册和添加完善。
        user: [
            {
                id: Random.id(),
                name: 'admin',
                password: 'admin'
            },
            {
                id: Random.id(),
                name: 'nimo',
                password: '123456'
            },
            {
                id: Random.id(),
                name: 'judy',
                password: '123456'
            },
            {
                id: Random.id(),
                name: 'nico',
                password: '123456'
            },
            {
                id: Random.id(),
                name: 'shake',
                password: '123456'
            }
        ]
    },
    get: function () {
        return this._data
    },
    set: function (data) {
        this._data = data
    },
    addUser: function (data) {
        this._data.user.push({
            id: Random.id(),
            name: data.user,
            password: data.password
        })
    }
}