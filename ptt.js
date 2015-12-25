#!/usr/bin/env node

var program = require('commander');
var request = require('request');
var ymlLoader = require('require-yml');

program
  .version('0.0.1')
  .option('-t, --token [value]', 'add table token')
  .option('-d, --data [value]', 'add data')
  .option('-i, --id [value]', 'add table id')
  .option('-n, --name [value]', 'add config name id')
  .parse(process.argv);

if (!program.name) {
  if (!program.token) {
    return console.log('请添加table token!');
  }
  if (!program.data) {
    return console.log('请添加数据!');
  }
  if (!program.id) {
    return console.log('请添加表格id!');
  }
}

var yml = ymlLoader('./config.yml');
var config = yml[program.name];

if (!config) {
  return console.error('找不到改表的记录');
}

program.id = config.id;
program.token = config.token;

request
  .get(`http://service.treation.com/api/v1/tables/${program.id}.json?table_token=${program.token}`, function(err, response, body){
    if (err) {
      return console.error(err);
    }
    body = JSON.parse(body);

    if (body.message) {
      return console.error(body.message);
    }

    var args = program.data.split(',');
    var cells = {};
    var res = {};

    body.table.columns.forEach(function(column, i){
      cells[column.id] = args[i];
      res[column.name] = args[i];
    })

    request({
        method: 'POST',
        uri: `http://service.treation.com/api/v1/tables/${program.id}/records.json`,
        body: {
          table_token: program.token,
          cells: cells
        },
        json: true
      }, function(err, response, body){
        if (err) {
          return console.error(err);
        }
        console.log(`成功插入${config.name} :`);
        console.log(res);
      })

  })
