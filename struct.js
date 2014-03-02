function loop(num){
	return Array.apply(null,Array(num));
}
function dictVal(dict){
    return dict[dictKey(dict)];
}
function dictKey(dict){
    return Object.keys(dict)[0];
}
function parse1(dict){
	var key=dictKey(dict);
	var val=dictVal(dict);
	switch (key){
		case 'or':
			return new Choose(val.map(parse1));
        case 'concat':
        case 'orderand':
			return new Concatinate(val.map(parse1));
		case 'optional':
			return new Check(parse1(val));
		case 'commas':
			return new Repeat(parse1(val),',',Number(key=='oneormore'));
        case 'anynumber':
        case 'oneormore':
        	return new Repeat(parse1(val),' ',Number(key=='oneormore'));
        case 'range2':
        	return new Repeat(parse1(val['expr']),' ',val['min']['NUMBER'],val['max']['NUMBER']);
        case 'range1':
        	return new Repeat(parse1(val['expr']),' ',val['number']['NUMBER'],val['number']['NUMBER']);
		case 'SYMBOL':
			return new Symbol(val)
		case 'VARIABLE':
			return new Variable(val)
	}

}

function random(val){
	if(val_dict[val])
		return val_dict[val][1]()
	else
		return val
}
function increaseVal(val,ind,str){
	if(val_dict[val])
		return val_dict[val][2](str,ind,1)
	else
		return str
}
function decreaseVal(val,ind,str){
	if(val_dict[val])
		return val_dict[val][2](str,ind,0)
	else
		return str
}

//errors
function copy(){
	return new this.constructor.apply(null,this.cons())
}
//errors
function valCopy(){
	return new this.constructor(this.children.map(function(x){
		return x.valCopy();
	}))
}
function changeState(state,undef){
	resetProps()
	if (state<this.min)state=this.min;
	else if (this.max!=undef&&state>this.max)state=this.max;
	this.state=state;
}
function increaseState(){
	this.changeState(this.state+1);
}
function decreaseState(){
	this.changeState(this.state-1);
}

function randomizeVars(){
		this.children.forEach(function(x){x.randomizeVars();})
		updateControls();
};
function table(){
	if (Array.isArray(arguments[0]))arguments=arguments[0];
	str=''
	for (var i = 0; i < arguments.length; i++) {
		str+=arguments[i]
	};
	return '<div class="controls-table">'+str+'</div>'
}
function row(){
	if (Array.isArray(arguments[0]))arguments=arguments[0];
	str=''
	for (var i = 0; i < arguments.length; i++) {
		str+=arguments[i]
	};
	return '<div class="controls-row">'+str+'</div>'
}
function Choose(children){
	var self=this;
	this.state=0;
	this.min=0;
	this.max=children.length-1
	this.children=children;
	this.render=function(){
		return this.children[this.state].render();
	}
	this.show=function(arr,undef){
		if(arr==undef){
			var arr=[]
			return[this.show(arr),arr]
		}
		var ind=arr.push(this)-1;
		return table(row('<button onclick="curr_dict['+ind+'].decreaseState()"'+((self.state==self.min)?' disabled':'')+'>&lt;</button>',
			'<input id="pla_'+ind+'" readonly="readonly" value="'+this.render()+'" onkeypress="pressed(event,this)"/>',
			'<button onclick="getProps();curr_dict['+ind+'].randomizeVars()">R</button>',
			'<button onclick="curr_dict['+ind+'].increaseState()"'+((self.state==self.max)?' disabled':'')+'>&gt;</button>'),
			row(this.children[this.state].show(arr)))
	}
	this.copy=function(){
		return new this.constructor(this.children.map(function(x){
			return x.copy();
		}))
	}
	this.valCopy=valCopy;
	this._changeState=changeState;
	this.changeState=function(state){
		this._changeState(state);
		updateControls();
	}

	this.increaseState=increaseState;
	this.decreaseState=decreaseState;
	this.randomizeVars=function(){
		this.children[this.state].randomizeVars();
		updateControls();
	};
}
function Concatinate(children){
	this.children=children;
	this.render=function(){
		return this._join(this.children.map(function(x){return x.render();}));
	}
	this.show=function(arr,undef){
		if(arr==undef){
			var arr=[]
			return[this.show(arr),arr]
		}
		var ind=arr.push(this)-1;
		return table(row('<input id="pla_'+ind+'" readonly="readonly" value="'+this.render()+'" onkeypress="pressed(event,this)"/>',
			'<button onclick="getProps();curr_dict['+ind+'].randomizeVars()">R</button>'),
			row(this.children.map(function(x){return x.show(arr);}),1))
	}
	this._join=function(arr){
		return arr.join(' ')
	}
	this.copy=function(){
		return new this.constructor(this.children.map(function(x){
			return x.copy();
		}))
	}
	this.valCopy=valCopy;
	this.randomizeVars=randomizeVars;
}
function Repeat(child,sep,min,max){
	var self=this;
	this.min=min;
	this.state=min;
	this.max=max;
	this.child=child;
	this.children=[child];
	if (this.state)loop(this.state-1).forEach(function(){self.children.push(self.child.copy())})
	this.sep=sep
	this.render=function(){
		return this._join(this.children.map(function(x){return x.render();}));
	}
	this.show=function(arr,undef){
		if(arr==undef){
			var arr=[]
			return[this.show(arr),arr]
		}
		var ind=arr.push(this)-1;
		return table(row('<button onclick="curr_dict['+ind+'].decreaseState()"'+((self.state==self.min)?' disabled':'')+'>-</button>',
			'<input id="pla_'+ind+'" readonly="readonly" value="'+this.render()+'" onkeypress="pressed(event,this)"/>',
			'<button onclick="getProps();curr_dict['+ind+'].randomizeVars()">R</button>',
			'<button onclick="curr_dict['+ind+'].increaseState()"'+((self.state==self.max)?' disabled':'')+'>+</button>'),
			row(this.children.map(function(x){return x.show(arr);})))
	}
	this._join=function(arr){
		return arr.join(this.sep)
	}
	this.copy=function(){
		return new this.constructor(this.child.copy(),this.sep,this.min,this.max)
	}
	this.valCopy=valCopy;
	this._changeState=changeState;
	this.changeState=function(state){
		var self=this;
		this._changeState(state);
		var diff=this.children.length-this.state;
		if (diff>0)loop(diff).forEach(function(){self.children.pop()})
		else if (diff<0)loop(-diff).forEach(function(){self.children.push(self.child.copy())})
		updateControls();
	}
	this.increaseState=increaseState;
	this.decreaseState=decreaseState;
	this.randomizeVars=randomizeVars;
}
function Check(child){
	var self=this;
	this.state=1;
	this.min=0;
	this.max=1;
	this.child=child
	this.children=[child];
	this.render=function(){
		if (this.state)
	 		return this.children[0].render();
	 	else
	 		return ''
	}
	this.show=function(arr,undef){
		if(arr==undef){
			var arr=[]
			return [this.show(arr),arr]
		}
		var ind=arr.push(this)-1;
		console.log(this)
		return table(row('<button onclick="curr_dict['+ind+'].decreaseState()"'+((self.state==self.min)?' disabled':'')+'>OFF</button>',
			'<input id="pla_'+ind+'" readonly="readonly" value="'+this.render()+'" onkeypress="pressed(event,this)"/>',
			'<button onclick="getProps();curr_dict['+ind+'].randomizeVars()">R</button>',
			'<button onclick="curr_dict['+ind+'].increaseState()"'+((self.state==self.max)?' disabled':'')+'>ON</button>'),
			row((this.state?('<tr><td colspan=3>'+this.children[0].show(arr)+'</td></tr>'):'')))
	}
	this.copy=function(){
		return new this.constructor(this.child.copy())
	}
	this.valCopy=valCopy;
	this._changeState=changeState;
	this.changeState=function(state){
		var self=this;
		this._changeState(state);
		var diff=this.children.length-this.state;
		if (diff>0)loop(diff).forEach(function(){self.children.pop()})
		else if (diff<0)loop(-diff).forEach(function(){self.children.push(self.child.copy())})
		updateControls();
	}
	this.increaseState=increaseState;
	this.decreaseState=decreaseState;
	this.randomizeVars=randomizeVars;
}
function Variable(type,val,undef){
	this.type=type;
	this._random=function(){return random(this.type);};
	this._increaseVal=function(ind){return increaseVal(this.type,ind,this.val);};
	this._decreaseVal=function(ind){return decreaseVal(this.type,ind,this.val);};
	if (val!=undef){
		this.val=val;
	}
	else this.val=this._random();
	this.randomizeVars=function(){
		this.val=this._random();
		updateControls();
	};
	this.increaseVal=function(ind){
		this.val=this._increaseVal(ind);
		updateControls();
	};
	this.decreaseVal=function(ind){
		this.val=this._decreaseVal(ind);
		updateControls();
	};
	this.render=function(){
		return this.val;
	};
	this.show=function(arr,undef){
		if(arr==undef){
			var arr=[]
			return[this.show(arr),arr]
		}
		var ind=arr.push(this)-1;
		return row('<button onclick="curr_dict['+ind+'].decreaseVal('+ind+')">-</button>',
			'<input id="pla_'+ind+'" class="val'+
			((this.type=='color')?" color1":'')+
			'" value="'+
			this.render()+'" onchange="curr_dict['+
			ind+'].val=this.value;updateControls();" onkeypress="pressed(event,this)" />',
			'<button onclick="getProps();curr_dict['+ind+'].randomizeVars()">R</button>',
			'<button onclick="curr_dict['+ind+'].increaseVal('+ind+')">+</button>');
	}
	this.changeVal=function(val,undef){
		this.val=val;
	};
	this.copy=function(){
		return new Variable(this.type);
	};
	this.valCopy=function(){
		return new Variable(this.type,this.val);
	};
};
var hash="#";
function Symbol(str){
	this.str=str;
	this.render=function(){
		return str;
	}
	this.show=function(arr,undef){
		if(arr==undef){
			var arr=[]
			return[this.show(arr),arr]
		}
		return '<input readonly="readonly" class="sym" value="'+this.render()+'" /">';
	}
	this.valCopy=this.copy=function(){return new Symbol(this.str);}
	this.randomizeVars=function(){};
}