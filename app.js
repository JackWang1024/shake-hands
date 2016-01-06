// 本项目使用 express 框架 
// 框架文档 http://www.expressjs.com.cn/4x/api.html
var express = require('express')
var Handlebars = require('handlebars')
var app = express()
var model = require('./model/data')
var fs = require('fs-extra')
var bodyParser = require('body-parser')

// 扩展插件
app.use(bodyParser.urlencoded({extended: false}))


// 配置当文件目录下的 static 目录为静态资源目录
// 可通过 http://127.0.0.1:7238/js/base.js 访问资源
app.use(express.static(__dirname + '/static/'))

// 监听 7238 端口
app.listen(7238)

// 获取所有用户信息
app.use('/all_user/', function (req, res, next) {
    var data = model.get()
    var html = render(data.user, '/view/all_user.html', req)
    res.send(html)
})

// 登录渲染页面
app.get('/login/', function (req, res, next) {
    var html = render({}, '/view/login.html', req)
    res.send(html)
})
// 登录ajax
app.post('/login/', function (req, res, next) {
    var data = model.get()
    var existUsers = {}
    data.user.forEach(function (item) {
        existUsers[item.name] = item.password
    })
    if (existUsers[req.body.user]) {
        if (existUsers[req.body.user] === req.body.password) {
            res.send({
                status: 'success'
            })
        }
        else {
            res.send({
                status: 'error',
                msg: '密码错误'
            })
        }
    }
    else {
        res.send({
            status: 'error',
            msg: req.body.user + '用户不存在'
        })
    }
})

// 注册显示页面
app.get('/register/', function (req, res, next) {
    var data = {}
    var html = render(data, '/view/register.html', req)
    res.send(html)
})

// 注册ajax
app.post('/register/', function (req, res, next) {
    var data = model.get()
    req.body.user = req.body.user.trim()
    req.body.password = req.body.password.trim()
    // 数据验证
    if (req.body.user.length === 0) {
        res.send({
            status: 'error',
            msg: '用户名不能为空'
        })
        return
    }

    var existUsers = {}
    data.user.forEach(function (item) {
        existUsers[item.name] = item.password
    })
    if (existUsers[req.body.user]) {
        res.send({
            status: 'error',
            msg: '用户已存在'
        })
        return
    }
    if (req.body.password.length < 5) {
        res.send({
            status: 'error',
            msg: '密码长度必须大于等于6'
        })
        return
    }
    if (req.body.password !== req.body.confirm_password) {
        res.send({
            status: 'error',
            msg: '密码和确认密码不一致'
        })
        return
    }
    // 添加数据到数据库
    model.addUser({
        user: req.body.user,
        password: req.body.password
    })
    res.send({
        status: 'success'
    })
})



// 将页面请求的 GET 和 POST参数显示在页面中
app.use('/', function (req, res, next) {
    var data = {
        GET: req.query,
        POST: req.body,
        HEADERS: req.headers
    }
    var html = render(data, '/view/index.html', req)
    res.send(html)
})



// 工具方法
// -------

// 封装一个渲染函数
 function render (data, templatePath, req) {
    // 为了方便演示，此处使用同步操作  readFileSync 
    var template = fs.readFileSync(__dirname + templatePath, 'utf8')
    var thisRender = Handlebars.compile(template)
    return thisRender(data)
}
// 扩展 include 功能 | 不了解 handlebars 请无视
Handlebars.registerHelper('-include', function (templatePath, hash) {
    var template = fs.readFileSync(__dirname + templatePath, 'utf8')
    template = Handlebars.compile(template)
    // 因为作用是示例，此处使用 SafeString 可能会存在安全问题
    return new Handlebars.SafeString(template(hash.data.root))
})
// 扩展 json 功能
Handlebars.registerHelper('-json', function (data) {
    return formatJson(JSON.stringify(data))
})
// 格式化 json 
var formatJson = function (json, indentChars) {
    function repeat(s, count) {
        return new Array(count + 1).join(s);
    }
    var i           = 0,
      il          = 0,
      tab         = (typeof indentChars !== "undefined") ? indentChars : "    ",
      newJson     = "",
      indentLevel = 0,
      inString    = false,
      currentChar = null;

    for (i = 0, il = json.length; i < il; i += 1) { 
      currentChar = json.charAt(i);

      switch (currentChar) {
      case '{': 
      case '[': 
          if (!inString) { 
              newJson += currentChar + "\n" + repeat(tab, indentLevel + 1);
              indentLevel += 1; 
          } else { 
              newJson += currentChar; 
          }
          break; 
      case '}': 
      case ']': 
          if (!inString) { 
              indentLevel -= 1; 
              newJson += "\n" + repeat(tab, indentLevel) + currentChar; 
          } else { 
              newJson += currentChar; 
          } 
          break; 
      case ',': 
          if (!inString) { 
              newJson += ",\n" + repeat(tab, indentLevel); 
          } else { 
              newJson += currentChar; 
          } 
          break; 
      case ':': 
          if (!inString) { 
              newJson += ": "; 
          } else { 
              newJson += currentChar; 
          } 
          break; 
      case ' ':
      case "\n":
      case "\t":
          if (inString) {
              newJson += currentChar;
          }
          break;
      case '"': 
          if (i > 0 && json.charAt(i - 1) !== '\\') {
              inString = !inString; 
          }
          newJson += currentChar; 
          break;
      default: 
          newJson += currentChar; 
          break;                    
      } 
    } 
    return newJson; 
}