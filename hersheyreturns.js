/**
 * HersheyReturns v0.1.1
 * by Lionel Maes - http://lavillahermosa.com/
 *
 * @license GNU GPL v3 or (at your option) any later version. 
 * http://www.gnu.org/licenses/gpl.html
 */


var HersheyReturns = (function(){
    
    function HersheyReturns(options){
       
        this.elem = $(options.elem);
        this.font = options.font.chars;
        
        this.color = options.color ? options.color : this.setColor();
        this.fill = options.fill ? options.fill : 'none';
        this.strokeWidth = options.strokeWidth ? options.strokeWidth : 1;
        
        this.pos = options.pos ? options.pos : {x:0, y:0}
        
        this.baseScale = this.setScale();
        
        this.scaleWidth = options.scaleWidth ?  this.baseScale * options.scaleWidth : this.baseScale;
        this.scaleHeight = options.scaleHeight ? this.baseScale * options.scaleHeight : this.baseScale;
        
        this.centerWidth = options.centerWidth ? options.centerWidth : this.setCenterWidth();
        
        this.lineSpacing = options.lineSpacing ? options.lineSpacing:this.setLineSpacing();
        this.letterSpacing = options.letterSpacing ? options.letterSpacing:this.setLetterSpacing();
        this.whiteSpace = options.whiteSpace ? options.whiteSpace:this.setWhiteSpace();
        this.charHeight = options.charHeight ? options.charHeight:this.setCharHeight();
        
        
        
        if(options.autoResize){
            
            $(window).resize($.proxy(this.resizeHandler, this));
            this.wW = $(window).width();
        }
        this.html = this.elem.html();
        this.build();
    }
    
    HersheyReturns.prototype.build = function(){
        this.text = this.utilsNormAccents(this.elem.text());
        this.text = this.text.replace(/\s{2,}/g, " ").trim();
        this.width = this.elem.width();
        this.height = this.elem.height();
        this.elem.empty();
        this.target = $('<svg>').attr({'width':this.width, 'height':this.height});
        this.elem.append(this.target);
        this.render();
    };
    
    HersheyReturns.prototype.update = function(){
        this.elem.empty();
        this.elem.html(this.html);
        this.build();
        
    };
    
    //set scale based on font-size of elem
    HersheyReturns.prototype.setScale = function(){
        return parseFloat(this.elem.css('font-size')) / 24;
    };
    
    //set linespacing based on line-height of elem and scaleHeight
    HersheyReturns.prototype.setLineSpacing = function(){
        return (parseFloat(this.elem.css('line-height')) - parseFloat(this.elem.css('font-size'))) * this.scaleHeight;
        
    };
    
    //set letter spacing based on letter-spacing of elem and scaleWidth 
    HersheyReturns.prototype.setLetterSpacing = function(){
        return parseFloat(this.elem.css('letter-spacing')) * this.scaleWidth;
        
    };
    
    HersheyReturns.prototype.setCenterWidth = function(){
        return (this.elem.css('text-align') == 'center');
        
    };
    
    HersheyReturns.prototype.setWhiteSpace = function(){
        return 8 * this.scaleWidth;
        
    };
    
    HersheyReturns.prototype.setCharHeight = function(){
        return 28 * this.scaleHeight;
        
    };
    
    HersheyReturns.prototype.setColor = function(){
            return this.elem.css('color')
    }
    
    HersheyReturns.prototype.renderWord = function(word){
        
        var charOffset = 0;
        var wordHeight = 0;
        var $word = $('<g>');
        
        for(var i in word) {
            var index = word.charCodeAt(i) - 33;
            
            if (!this.font[index]) continue;
            
            var path = Raphael.transformPath(this.font[index].d, 's'+this.scaleWidth+','+this.scaleHeight+',0,0');
            var charPath = $('<path>');
            charPath.attr({
                d: path,
                style: 'stroke:'+this.color+'; stroke-width:'+this.strokeWidth+'; fill:'+this.fill+';',
                
                transform: 'translate(' + charOffset + ', 0)'
            });
            $word.append(charPath);
            var charBBox =  Raphael.pathBBox(path);
            
            charWidth = charBBox.width + charBBox.x;
            wordHeight = (charBBox.height + charBBox.y > wordHeight)?charBBox.height + charBBox.y:wordHeight;
            charOffset += charWidth + this.letterSpacing;
           
        }
       
        return {'$word':$word, 'width':charOffset, 'height':wordHeight};
        
    };
    
    HersheyReturns.prototype.renderLine = function(){
        
        var wordOffset = 0;
        var lineHeight = 0;
        var $line =  $('<g>').attr({
            style: 'stroke:'+this.color+'; fill:none;',
        });
        
        while(this.wordCount < this.words.length){
            var word = this.words[this.wordCount];
            var gWord = this.renderWord(word);
            
            gWord.$word.attr({transform: 'translate(' + wordOffset + ', 0)'});
            
            if(wordOffset + gWord.width > this.width){
                if(gWord.width > this.width){
                    //if the word doesn't fit into the line, we stop. TODO: word break or width enlargement!
                    console.log('elem width too big');
                    return;
                }
                this.lines[this.lineCount] = {'$line':$line,'width':wordOffset, 'height':lineHeight};
                this.lineCount++;
                this.renderLine();
                return;
                
            }
            lineHeight = (gWord.height > lineHeight)?gWord.height:lineHeight;
            $line.append(gWord.$word);
            
            wordOffset += gWord.width + this.whiteSpace;
            this.wordCount++;
            
            
        }
        
        this.lines[this.lineCount] = {'$line':$line,'width':wordOffset, 'height':lineHeight};
        this.lineCount++;
        
    }
    
    HersheyReturns.prototype.render = function(){
        
        //Create main group
        var $group = $('<g>').attr({
            style: 'stroke:'+this.color+'; fill:none;',
            transform: 'translate('+this.pos.x+', '+this.pos.y+')'
        });
       
       
        var lineOffset = {'left':0, 'top':0};
        this.words = this.text.split(' ');
        
        this.lineCount = 0;
        this.wordCount = 0;
        this.lines = [];
        
        //First we build the text lines
        this.renderLine();
        
        //Then we place them inside the main group
         for(var i = 0; i <  this.lineCount; i++){
            if(this.centerWidth){
                var lineWidth = this.lines[i].width;
                lineOffset.left = (this.width - lineWidth) / 2;
            }
            this.lines[i].$line.attr({transform: 'translate('+lineOffset.left+', '+lineOffset.top+')'});
            $group.append(this.lines[i].$line);
           
            if(i == this.lineCount - 1)
                lineOffset.top += this.lines[i].height;
            else
                lineOffset.top += this.charHeight + this.lineSpacing;
           
        }
        
        this.target.attr({'height':lineOffset.top});
        this.target.append($group);
        
        
        this.elem.append(this.target);
        this.elem.html(this.elem.html());
        
        
        
    };
    
    HersheyReturns.prototype.resizeHandler = function(){
       if(this.resizeId != undefined){
            clearTimeout(this.resizeId);
        }
        
        if($(window).width() == this.wW){   
            return;
        } 
        
        this.resizeId = setTimeout($.proxy(this.resize, this), 250);
    
    };
    
    HersheyReturns.prototype.resize = function(){
        this.wW = $(window).width();
        this.update();
    };
    
    
    //remove accents utility
    HersheyReturns.prototype.utilsNormAccents = function(str){
        var accent = [
        /[\300-\306]/g, /[\340-\346]/g, // A, a
        /[\310-\313]/g, /[\350-\353]/g, // E, e
        /[\314-\317]/g, /[\354-\357]/g, // I, i
        /[\322-\330]/g, /[\362-\370]/g, // O, o
        /[\331-\334]/g, /[\371-\374]/g, // U, u
        /[\321]/g, /[\361]/g, // N, n
        /[\307]/g, /[\347]/g, // C, c
        ];
        var noaccent = ['A','a','E','e','I','i','O','o','U','u','N','n','C','c'];
     
   
        for(var i = 0; i < accent.length; i++){
            str = str.replace(accent[i], noaccent[i]);
        }
     
        return str;
    
    };
    
    return HersheyReturns;
})();
