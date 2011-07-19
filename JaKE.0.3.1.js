/*!
 * JaKE - Javascript Kinematics Engine
 * http://deadcomosnaut.com
 * Developed by Danilo Costa Vespa
 * http://twitter.com/dvespa
 * d.vespa@gmail.com
 * Date: Sat Jul 18 0:00:48 2011 -0300
 */
(function($){        
    $.fn.extend({
    // configures the basic sprite's properties
        create: function(p){
            var f = $.actions;
			rate = p.decelerate;
			if (rate > 1) p.frameInitial = f.speedControl(p.frameInitial, rate);
            opt = $.extend({},f.confCharacter,p || {});
            objId = $(this).attr("id");
			$(this).css({position:"absolute",});
			if(typeof p.posX !="undefined"){
				$(this).css( {
					marginLeft: opt.posX,
					marginTop: opt.posY,							 
				});
			};
            tx = {frameSize: f.formatSprite(opt, this)};
			tx.name = objId;
            opt = $.extend({},opt,tx || {});
            f.cast[objId] = opt;
            return this;
        },

    // set the lines to read with this.move() and starts frame's animation
	// TODO: repensar condicional: play deve exister para a ação acontecer. Guardar actions num array?
		play : function(){
			var f = $.actions;
			obj = f.findObj(this);
			obj.stopMove = false;
			timebomb = function(){
				obj.stopMove = true;
				$(this).stop();
			};

			setTimeout(timebomb , obj.totalMoves * obj.velocity + 20);
			return this;
		},
		//use only you need two or more moves
        sequence: function(p){
			var f = $.actions;
 			obj = f.findObj(this);
			obj.totalMoves++;
 			$.actions.move(p, this);
            return this;
        },
		//user for a unique moviment command
		run: function(p){
			$(this).stop();
			this.sequence(p);
            return this;			
		},
		// store the next moves sequence of the object
		nextMove: function(p){
			var f = $.actions;
			o = f.findObj(this);
			// TODO: pensar num jeito de mudar dinamicamente o totalmoves
			time = o.velocity * o.totalMoves;
			o.totalMoves = 0;
			
			if(typeof tx != undefined) clearTimeout(tx);
			var tx = setTimeout(p, time);
			return this;
		}
    });
    
    // all action functions
    $.actions = {
		// set frames per second
		frameRate: 64,
		// store our animated objects and their configuration 
        cast:[],	
		// basic configuration for any new animated object
        confCharacter: {
			name: false,
			// decelerate static objects. 
			decelerate: 1,
			lineHeight: 0,
            frameInitial:[0],      
            frameSize:0,
			frameAtual:0,
			staticObj: false,
            posX:0,
            posY:0,
            moveTop:0,
            moveRight:0,
            moveLeft:0,
            moveBottom:0,
			totalMoves: 0,
			stopMovie: false,
			velocity: 1000
        },

        timeLine: function(){
		// Test all objects if they are moving or not
			twing = setInterval(
				function(){
					act = $.actions;
					ntx = act.cast;
					for(x in ntx){
						act.itsAlive(ntx[x]);				
					};						  
				}, $.actions.frameRate
			)
		},
		// decelerate control
		speedControl: function(t, p){
			tex = new Array();
			for(x=0;x<t.length;x++){
				for(i=0;i < p; i++){
					tex.push(t[x]);
				}
			};
			t = tex;
			return t;
		},
		findObj: function(o){
	 		objId = $(o).attr("id");
			return this.cast[objId];			
		},   
		// defines wich of the object's frame should appear
		myMove : function(m, t){
				ob = "#" + t.name;
				nb = (isNaN(m[t.frameAtual]))? t.frameInitial : m[t.frameAtual];
				p = $(ob).width() * nb;
				style =	{"background-position": "-"+ p + "px -" + t.lineHeight + "px"};
				$(ob).css(style);				
				t.frameAtual++;
				t.frameAtual = (t.frameAtual >= m.length)?  0 : t.frameAtual++;		
	
		},		
		itsAlive: function(t){
			ob = "#" + t.name;
			f = $.actions;
			// find target's position
			this.myPos = function(m){
					if(t.staticObj == true){
						// fix ie
						m = $(ob).css(m);
						return m;
					}else{
						m = Math.ceil($(ob).css(m).replace("px", ""))+ 0;
						return m;
					};
				return m;
			};
			
			t.actualPosX = f.myPos("margin-left");
			t.actualPosY = f.myPos("margin-top");
			
			// left
			if(t.actualPosX > t.posX){				
				f.myMove(t.moveLeft,t);
			}
			// right
			else if(t.actualPosX < t.posX){				
				f.myMove(t.moveRight,t);
			//	return false;
			}	
			// down
			else if((t.actualPosY > t.posY) && (t.posX == t.actualPosX)){				
				f.myMove(t.moveBottom,t);
			}		
			// up
			else if((t.actualPosY < t.posY) && (t.posX == t.actualPosX)){				
				f.myMove(t.moveTop,t);
			}
			//when stopped returns to initial frame
			else if(t.stopMove == true){	
				// TODO: rever este trecho: separar controle de estáticos e de dinamicos
				this.myMove(t.frameInitial, t);
			}else if((t.actualPosY == t.posY) && (t.posX == t.actualPosX)){	
				this.myMove(t.frameInitial, t);
			};
			t.posX = t.actualPosX;
			t.posY = t.actualPosY;
		},
        // captures the sprite and check his size 
        spriteSize:function(o){
            d = "sprite-container";
			$("#" + d).hide();
            if($("#"+d).size()==0) this.createContainer();
            spr = $(o).css("background-image");
            spr = spr.replace(/(url)|\(|\)|\"/g,"");
            ide = spr.match(/\w+\.(jpg|jpeg|png|gif)/gi, "");
			ide = ide[0].split(".");
            if ($("#"+d + " ."+ide[0]).size()==0) $("#"+d).append("<img class=\""+ide[0]+"\" src=\""+spr+"\"/>");
            spr = $("#"+d + " ."+ide[0]).width();
            return spr;
        },
        createContainer:function(){
            d = "sprite-container";
            $("body").append("<div id=\""+d+"\" style=\"position:absolute;top:-600px\"></div>");
        },
       
        move:function(p, t){
           	actual = this.cast[$(t).attr("id")];
		   	v = actual.velocity;		
			actual.stopMove = false;
			var f = this;
            var cont = p.length;
            for(x=0;x<cont;x++){
                actual = $.extend({},this.cast[$(t).attr("id")],p[x] || {});
                var c = actual;
                $(t).animate({
                    marginLeft: c.posX+"px",
                    marginTop: c.posY+"px"
                },    v);
		
            };

        },
        // defines the number of frames calculing width of the animated object x sprite width
        formatSprite: function(p, t){
            sprSize = Math.ceil($.actions.spriteSize(t));
            elem_width = Math.ceil($(t).width());
            frames_total = sprSize/elem_width;
            initial =  (sprSize/frames_total);
            return sprSize;
        }        
    }
})(jQuery);
$(document).ready(
	function(){
		$.actions.timeLine()
	}
);
