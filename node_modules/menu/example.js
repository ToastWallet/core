#!/usr/bin/env node

process.stdin.setEncoding('utf8');

var options;
var content = {
		tab1: {id:1, title:"column1", seltitle: "COLUMN1", type:"toggle", val:"true", color:"blue"},
		tab2: {id:2, title:["column2", "column22"], seltitle: ["COLUMN2", "COLUMN22"], type:"search", input: 0, val:"abcdefgh", color:"red"},
		tab3: {id:3, title:"column3", seltitle: "COLUMN3", type:"list", input: 0, val:["a", "b", "c"], color:"white"},
		tab4: {id:4, title:"column4", seltitle: "COLUMN4", type:"select", input: 0, val:["1","2","3","4","5","6"], color:"green"}
}

var menu = require('./index.js');
menu.init(content);

function work() {
	menu.start(options, function(result) {
		var key = result[0];
		var column = result[1];
		
		if(key.name=="return" && column.id === 4) {
			menu.draw();
			menu.clivas.line(Math.abs(column.input%column.val.length));
		} else if(key.name=="return" && column.id === 2) {
			menu.draw();
			menu.clivas.line("You searched for "+column.val);
			column.val = "";
		} else if(key.ctrl && key.name ==="c") {
			process.exit();
		} else if(key.name ==="backspace") {
			menu.draw();
		} else if(key.name ==="left") {
			menu.draw();
		} else if(key.name ==="up") {
			menu.draw();
		} else if(key.name ==="down") {
			menu.draw();
		} else if(key.name ==="right") {
			menu.draw();
		} else {
			menu.draw();
		}
		
		if(column.id === 1) {
			if(column.val) {
				menu.columns["tab4"].val = ["z","y","x","w"];
			} else {
				menu.columns["tab4"].val = ["1","2","3","4","5","6"];
			}
			menu.draw();
		}
	})
} work();