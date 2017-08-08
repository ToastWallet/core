var clivas = require('clivas')
var keypress = require('keypress')
keypress(process.stdin);

var currentCol;
var currentSel;

var idx = module.exports = {};
idx.clivas = clivas;
idx.columns;
idx.column_cnt = 0;
idx.column_val = 1000;

idx.init = function(cols) {
	idx.columns = cols;
	for(var key in idx.columns) {
		idx.column_cnt++;
		if(idx.columns[key].type == "list") {
			var tmp = idx.columns[key].val.length
			idx.columns[key].input = tmp*tmp*tmp;
		} else if(idx.columns[key].type == "select") {
			var tmp = idx.columns[key].val.length
			idx.columns[key].input = -1*tmp*tmp*tmp;
		} else if(idx.columns[key].type == "search") {
			var tmp = idx.columns[key].title.length;
			idx.columns[key].input = tmp*tmp*tmp;
		}
	}
	idx.draw();
}

function header_tab() {
	var cnt = 0;
	var modul = idx.column_val%idx.column_cnt;
	for(var key in idx.columns) {
		if(cnt === modul-1) {
			if(idx.columns[key].type === "search") {
				var i = idx.columns[key].input%idx.columns[key].title.length;
				clivas.write("{bold+"+idx.columns[key].color+":"+idx.columns[key].title[i]+" }");
				clivas.write("{bold:┃ }");
			} else {
				clivas.write("{bold+"+idx.columns[key].color+":"+idx.columns[key].title+" }");
				clivas.write("{bold:┃ }");
			}
		} else if(cnt === modul){
			currentCol = idx.columns[key];
			if(currentCol.type === "toggle") {
				clivas.write("{bold+"+currentCol.color+":"+currentCol.seltitle+" "+currentCol.val+" }");
			} else if(currentCol.type === "list") {
				var i = Math.abs(currentCol.input%currentCol.val.length);
				clivas.write("{bold+"+currentCol.color+":"+currentCol.seltitle+" "+currentCol.val[i]+" }");
			} else if(currentCol.type === "search") {
				var i = Math.abs(currentCol.input%currentCol.title.length);
				clivas.write("{bold+"+currentCol.color+":"+currentCol.seltitle[i]+" }");
			}
			else {
				currentSel = currentCol;
				clivas.write("{bold+"+idx.columns[key].color+":"+idx.columns[key].seltitle+" }");
			}
			clivas.write("{bold:┃ }");
		} else {
			if(idx.columns[key].type === "search") {
				var i = idx.columns[key].input%idx.columns[key].title.length;
				
				clivas.write("{bold+"+idx.columns[key].color+":"+idx.columns[key].title[i]+" }");
				clivas.write("{bold:│ }");
			} else {
				clivas.write("{bold+"+idx.columns[key].color+":"+idx.columns[key].title+" }");
				clivas.write("{bold:│ }");
			}
		}
		cnt++;
	}
}

idx.draw = function() {
	
	process.stdout.clearLine();
	process.stdout.cursorTo(0);
	clivas.clear()
	clivas.line("{bold:┎──────────────────────────────────────────────────────────────────────────────────────────────────────────────────}")
	clivas.write("{bold:┃ }");
	header_tab();
	clivas.line("")
	clivas.line("{bold:┠──────────────────────────────────────────────────────────────────────────────────────────────────────────────────}")

	if(currentSel !== undefined) {
		var x = Math.abs(currentSel.input%currentSel.val.length);
		for(var i=0; i<currentSel.val.length; i++) {
			if(x == i) {
				clivas.line("{bold+cyan+blink:>}"+"{bold+cyan: "+currentSel.val[i]+"}");
			}
			else {
				clivas.line("{bold:┃ "+currentSel.val[i]+"}");
			}
		}
	}

	if(currentCol.type === "toggle") {
	} else if(currentCol.type === "search") {
		clivas.line("{bold:┖──────────────────────────────────────────────────────────────────────────────────────────────────────────────────}")
		clivas.write(" Input:"+ currentCol.val)
	} else if(currentCol.type === "list") {
	}
}

idx.start = function(params, callback) {
	var stdin = process.openStdin()
	process.stdin.setRawMode(true)
	stdin.on('keypress', function (chunk, key) {
		if (key && key.ctrl && key.name == 'c') {
			callback([key, currentCol]);
		}
		else if(key.name == "right") {
			idx.column_val++;
			callback([key, currentCol]);
		}
		else if(key.name == "left") {
			idx.column_val--;
			callback([key, currentCol]);
		}
		else if(key.name == "up") {

			if(currentCol.type === "toggle") {
				if(currentCol.val != false) {
					currentCol.val = false;
				} else {
					currentCol.val = true;
				}
			} else if(currentCol.type === "list") {
				++currentCol.input;
			} else if(currentCol.type === "search") {
				++currentCol.input;
			} else if(currentCol.type === "select") {
				++currentCol.input;
			}
			
			callback([key, currentCol]);
		}
		else if(key.name == "down") {

			if(currentCol.type === "toggle") {
				if(currentCol.val != false) {
					currentCol.val = false;
				} else {
					currentCol.val = true;
				}
			} else if(currentCol.type === "list") {
				--currentCol.input;
			} else if(currentCol.type === "search") {
				--currentCol.input;
			} else if(currentCol.type === "select") {
				--currentCol.input;
			}
			
			callback([key, currentCol]);
		}
		else if(key.name == "backspace") {

			if(currentCol.type === "toggle") {
				if(currentCol.val != false) {
					currentCol.val = false;
				} else {
					currentCol.val = true;
				}
			} else if(currentCol.type === "list") {

			} else if(currentCol.type === "search") {
				currentCol.val = currentCol.val.slice(0, currentCol.val.length-1)
				clivas.write(" Search:"+ currentCol.val)
			}
			
			callback([key, currentCol]);
		}
		else if(key.name == "return") {
			if(currentCol.type === "toggle") {
				if(currentCol.val != false) {
					currentCol.val = false;
				} else {
					currentCol.val = true;
				}
			} else if(currentCol.type === "list") {
			} else if(currentCol.type === "search") {
			}
			
			callback([key, currentCol]);
		}
		else {
			if(currentCol.type === "toggle") {

			} else if(currentCol.type === "list") {

			} else if(currentCol.type === "search") {
				currentCol.val += chunk
				clivas.write(" Search:"+ currentCol.val)
			}
			callback([key, currentCol, clivas]);
		}
	})
}