# menu #

A cli menu for your node.

## Install ##
![build alt](https://travis-ci.org/roecrew/menu.svg?branch=master)
![platform alt](https://img.shields.io/badge/platform-windows%20|%20linux%20|%20osx-blue.svg)

```
npm install menu
```

![ScreenShot1](http://s23.postimg.org/l4zi60cuj/Screen_Shot_2015_04_03_at_19_02_29.png)

## API ##
#### Tabs
Menu is built around tabs. <br><br>
There are currently four types: <br>
  * **Toggle**: This tab functions like a button. 
  * **List**: This tab selects a single value from its list. 
  * **Search**: This tab takes a string input, and has the function of a list tab.
  * **Select**: This tab creates a selectable drop-down list.
<br>
	
These tabs are declared as such...

    var content = {
    	tab1: {title:"column1", seltitle: "COLUMN1", type:"toggle", val:"true", color:"blue"},
    	tab2: {title:["column2", "column22"], seltitle: ["COLUMN2", "COLUMN22"], type:"search", input: 0, val:"abcdefgh", color:"red"},
    	tab3: {title:"column3", seltitle: "COLUMN3", type:"list", input: 0, val:["a", "b", "c"], color:"white"},
    	tab4: {title:"column4", seltitle: "COLUMN4", type:"select", input: 0, val:["1","2","3","4","5","6"], color:"green"}
    }

#### Properties

title: This is the tabs label when it's not focused.<br>
seltitle: This is the tabs label when it is focused.<br>
type: This is the tab's type.<br>
input: This is the index value for a **list**, **select**, and **search** tabs.<br>
val: For type **toggle**, it's a boolean value. For types **list** and **select**, it's an array of values. For type **search** it's a string.<br>
color: The tab's set color. Look at the node **clivas** for all possible values.

#### Initialization

    var menu = require('./index.js');
    
    menu.init(content);					
    
    menu.draw()							//this draws the headers
    
	menu.clivas							//you can custom draw with clivas
    
#### Delegate

    function work() {
        menu.start(options, function(result) {
            var key = result[0]; 						//refer to node keypress for all properties
            var column = result[1]; 					//the focused tab
            
            menu.draw();								//draw tabs
            
            if(key.name=="return" && column.id === 4) {			
				menu.clivas.line(Math.abs(column.input%column.val.length));	//always mod your column input to determine focused index
			} else if(key.name=="return" && column.id === 2) {
				menu.clivas.line("You searched for "+column.val);
				column.val = "";
			} else if(key.ctrl && key.name ==="c") {
				process.exit();
			} else if(key.name ==="backspace") {
				
			} else if(key.name ==="left") {
				
			} else if(key.name ==="up") {
				
			} else if(key.name ==="down") {
				
			} else if(key.name ==="right") {
				
			} else {
				
			}
		
			if(column.id === 1) {					//use tab 1 to toggle tab 4's select contents
				if(column.val) {
					menu.columns["tab4"].val = ["z","y","x","w"];
				} else {
					menu.columns["tab4"].val = ["1","2","3","4","5","6"];
				}
				menu.draw();
			}
        })
    } work();
