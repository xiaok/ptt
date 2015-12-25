#!/usr/bin/env node

var program = require('commander');
var request = require('request');
var context = {};

program
  .version('0.0.1')
  .option('-t, --token [value]', 'add table token')
  .option('-d, --data [value]', 'add data')
  .option('-i, --id [value]', 'add table id')
  .parse(process.argv);

if (!program.token) {
  return console.log('请添加table token!');
}
if (!program.data) {
  return console.log('请添加数据!');
}
if (!program.id) {
  return console.log('请添加表格id!');
}

request
  .get(`http://service.treation.com/api/v1/tables/${program.id}.json?table_token=${program.token}`, function(err, response, body){
    if (err) {
      console.error(err);
    }
    body = JSON.parse(body);

    if (body.message) {
      console.error(body.message);
    }

    context.data = body.table

    var args = program.data.split(',');
    var cells = {};

    context.data.columns.forEach(function(column, i){
      cells[column.id] = args[i];
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
          console.error(err);
        }
        console.log('sucess added!');
      })

  })
