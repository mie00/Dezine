function $$(id){return document.getElementById(id);}
function eq(a,b){
    if (a.length!=b.length)return false
    for (var i = 0; i < a.length; i++) {
        if (a[i]!=b[i])return false
    };

    return true
}
function Element(tag,classes,parent,content,args,undef){
    self=this;
	if (content=="lorem")content="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid, officia, laudantium, iusto minus similique aliquam sapiente deserunt qui illo quia quam magni voluptatem atque maiores cum eveniet accusantium impedit quae cupiditate ea amet rem sed mollitia quis delectus libero sequi adipisci nobis hic animi voluptates rerum maxime dolorum. Voluptate, animi minus totam delectus aliquam hic itaque dolorum exercitationem eum obcaecati odio rerum error repellendus labore suscipit ipsum deserunt at dicta doloribus atque provident sapiente ut tempora dolore et! Magnam sint dicta a commodi consectetur. Consequatur, odit, veniam, minus nobis deleniti ducimus harum praesentium sed accusantium quam voluptatum molestiae sapiente eveniet."
    this.tag = (tag=="|")?"":tag;
    if (match1=classes.match(/\.\w+/g)){
        this.classes = match1.join(' ');
        this.classes=this.classes.replace(/\./g,'')
    }
    if (match1=classes.match(/#(\w+)/)){
        this.id = match1[1];
    }
    this.content = content;
    var args2={};
    if (args)args.slice(1,-1).split(',').forEach(function(x){var z=x.split('=');args2[z[0]]=(z[1]!=undef)?z[1]:null})
    this.args=args2;
    this.parent = parent;
    this.children = [];
    this.render=function(){
        var args2=this.args
        if (this.tag){
            result="<"+this.tag+((this.id)?" id='"+this.id+"'":"")+((this.classes)?" class='"+this.classes+"'":"")+
            
            ((args2)?Object.keys(args2).reduce(function(x,y){return x+" "+y+((args2[y]!=null)?('='+args2[y]):"")},""):"")

            +">"+this.content;
            for (var i = 0; i < this.children.length; i++) {
                result+=this.children[i].render()
            };
            result+="</"+this.tag+">";
        }
        else{
            result=this.content;
        }
        return result

    };
}
function parse(jade){
    jade=jade.replace(/^\t/gm,"    ")
    jade=jade.replace(/</g,'&lt;').replace(/>/g,'&gt;')
    sep='\n'
    if (jade.indexOf('\n\r')>=0)sep='\n\r';
    else if (jade.indexOf('\r')>=0)sep='\r';

    str=jade.split(sep)
    ladd=[];
    ladd[-1]=new Element("div","#appcontainer","","","");
    isnormaltext=0


    for (var i = 0; i < str.length; i++) {
        sent=str[i]
        if (sent.match(/^\s*$/))continue;
        if (isnormaltext){

            match=sent.match(new RegExp("^[ ]{"+(isnormaltext)+"}(.*)$"));
            if (match!=null){
                element=new Element("|","",ladd[isnormaltext/4-1],match[1]+'\n');
                ladd[isnormaltext/4-1].children.push(element)
            
            }
            else{
                isnormaltext=0;
            }

        }
        if (!isnormaltext){

            match=sent.match(/^((?:[ ]{4})*)(\w+|\|)((?:\.\w+)*(?:#\w+)?(?:\.\w+)*)(\.?)((?:\([^)]+\))?)[ ]*(.*)$/);
            console.log(match)
            element=new Element(match[2],match[3],ladd[match[1].length/4-1],match[6],match[5]);
            if(ladd[match[1].length/4-1])ladd[match[1].length/4-1].children.push(element)
            ladd[match[1].length/4]=element;

            if(match[4])isnormaltext=match[1].length+4;
        }

    };
    return ladd[-1].render()
}
function refreshStyle(){
    editor.save();
	if($$('less-error-message:inline'))$$('less-error-message:inline').remove();
	$$('miestyle').type='text/less';
	$$('miestyle').innerHTML="#miecont2{"+$$('ts').value+"}";
	less(window);
}
function refreshHTML(){
    editor2.save();
	$$('miebody').innerHTML=$$('tb').value=parse($$('ta').value);
}
function randfloat(x){
    return Math.random()*x
}
function randint(x){
    return Math.floor(randfloat(x+1))
}
function randchoise(arr){
    return arr[randint(arr.length-1)]
}
function concfn(num,fn,args){
    return Array.apply(null,Array(num)).map(function(){return randchoise.apply(null,args)})
}
function padzeros(str,num){
    return Array.apply(null,Array(num-str.length)).map(function(){return '0'}).join("")+str;
}
var curr_dict=[];
var curr_line;
var curr_prop;
var curr_id;
var curr_undo=[]
var curr_undo_loc;
var val_dict={
"alphavalue": ["0.7",function(){return randfloat(1)},function(str,ind,inc,step=0.1){if (!inc)step=-step;return Number(str)+step}],
"non-negative-integer": ["2",function(){return randint(10)},function(str,ind,inc,step=1){if (!inc)step=-step;return Number(str)+step}],
"number": ["2",function(){return randint(10)},function(str,ind,inc,step=1){if (!inc)step=-step;return Number(str)+step}],
"integer": ["2",function(){return randint(10)},function(str,ind,inc,step=1){if (!inc)step=-step;return Number(str)+step}],
"percentage": ["70%",function(){return randint(101)+'%'},function(str,ind,inc,step=1){if (!inc)step=-step;return Number(str.slice(0,-1))+step+'%'}],
"angle": ["70deg",function(){return randint(360)+'deg'},function(str,ind,inc,step=10){if (!inc)step=-step;return Number(str.slice(0,-3))+step+'deg'}],
//no change yet see color[2]
"color": ["#ab65d0",function(){return '#'+padzeros(randint(16777215).toString(16),6)},function(str,ind,inc,step=1){return str}],
"length": ["30px",function(){return randint(200)+'px'},function(str,ind,inc,step=1){if (!inc)step=-step;return Number(str.slice(0,-2))+step+'px'}],
"string": ["'MIE'",function(){return "'"+concfn(6,randchoise,['0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ']).join('')+"'"},function(str,ind,inc,step=1){return str}],
"time": ["2s",function(){return randint(5000)+'ms'},function(str,ind,inc,step=1){if (!inc)step=-step;return Number(str.slice(0,-1))+step+'S'}],
"mime-type": ["image/gif",function(){return "image/gif"},function(str,ind,inc,step=1){return str}],
"charset": ["UTF-8",function(){return "UTF-8"},function(str,ind,inc,step=1){return str}],
"encoded-data": ["R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7",function(){return "R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7"},function(str,ind,inc,step=1){return str}],
"x": ["30px",function(){return randint(200)+'px'},function(str,ind,inc,step=1){if (!inc)step=-step;return Number(str.slice(0,-2))+step+'px'}],
"y": ["30px",function(){return randint(200)+'px'},function(str,ind,inc,step=1){if (!inc)step=-step;return Number(str.slice(0,-2))+step+'px'}]}

function initialize(){
    var cursor=editor.getCursor()
    var line=cursor.line;
    var l=editor.getLine(line);
    if (match3=l.match(/^(\s*)([^:]+?)\s*:\s*(.*?)\s*;?$/)){
        curr_prop=match3[1]+match3[2];
        var prop=match3[2][0]!='-'?match3[2]:match3[2].match(/\-\w+\-(.+)$/)[1]
        if (prop in css_dict){
            curr_line=line
            updateControls(parse1(css_dict[prop]))
        }
    }

}
function updateControls(dict){
    var temp;
    if (dict){
        temp=dict.show()
    }
    else{
        temp=curr_dict[0].show()
    }
    if(!eq(curr_dict,temp[1])){

        curr_dict=temp[1];
        $$("controls").innerHTML=temp[0];
        document.getElementsByClassName("color1").map(function(el){new jscolor.color(el, 
            {hash:true,pickerClosable:true,pickerMode:'HVS',
                onImmediateChange:function(color){
                    if(curr_dict[el.id.slice(4)].val!='#'+this){
                        curr_dict[el.id.slice(4)].val='#'+this;
                        updateControls();
                    }
                },adjust:false
            }
        )}
        )

        if (curr_id){
            $$(curr_id).focus();
            curr_id=null;
        }
    }
    else{
        console.log(123)
        for (var i = 0; i < curr_dict.length; i++) {
            $$("pla_"+i).value=curr_dict[i].render();
        };
    }
    editor.setLine(curr_line,curr_prop+": "+curr_dict[0].render()+";")
    refreshStyle()
    

}
function pressed(ev,el){

    e = ev || window.event;
    var charCode = e.charCode || e.keyCode;
    if (e.ctrlKey == true){
        console.log(1)
        if (charCode == 32){
            curr_id=el.id;
            e.preventDefault();
            el.nextElementSibling.click()
        }
        if (charCode == 90 ||charCode == 122){
            undo();
            e.preventDefault();
        }
        if (charCode == 89 ||charCode == 121){
            redo();
            e.preventDefault();
        }

        if(el.previousElementSibling){
            if (charCode == 39){
                curr_id=el.id;
                e.preventDefault();
                el.nextElementSibling.nextElementSibling.click()

            }
            if (charCode == 37){
                curr_id=el.id;
                e.preventDefault();
                el.previousElementSibling.click()

            }
        }
    }
     
}
function undo(){
    if (curr_undo_loc-1>=0)
        setProps(curr_undo_loc-1)
}
function redo(){
    if (curr_undo_loc+1<curr_undo.length)
        setProps(curr_undo_loc+1)
}
function setProps(i){
    curr_undo_loc=i
    var arr=curr_undo[i];
    console.log(arr)
    keys=Object.keys(arr)
    for (var i = 0; i < keys.length; i++) {
        curr_dict[keys[i]].val=arr[keys[i]];
    };
    updateControls();
}
function getProps(){
    var arr={}
    curr_undo_loc=curr_undo.length
    for (var i = 0; i < curr_dict.length; i++) {
        if (curr_dict[i].constructor==Variable){
            arr[i]=$$("pla_"+i).value;
        };
    };
    curr_undo.push(arr)
}
function resetProps(){
    curr_undo=[];
    curr_undo_loc=null;
}
/*
TODO:
changing less makes a bug
less vars
increase,decrease val
spaces on tab before properties
docs
style
option=range{0,1}
*/


