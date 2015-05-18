



var HersheyReturns = (function(){
    
    function HersheyReturns(options){
       
        this.elem = $(options.elem);
        this.font = options.font.chars;
        
        this.color = options.color ? options.color : '#000000';
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
    
    //set linespacing based on line-height  of elem and scaleHeight
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
    
    HersheyReturns.prototype.renderWord = function(word){
        var self = this;
        var charOffset = 0;
        var wordHeight = 0;
        var $word = $('<g>');
        
        for(var i in word) {
            var index = word.charCodeAt(i) - 33;
            
            if (!self.font[index]) continue;
            
            var path = Raphael.transformPath(self.font[index].d, 's'+self.scaleWidth+','+self.scaleHeight+',0,0');
            var charPath = $('<path>');
            charPath.attr({
                d: path,
                style: 'stroke:'+self.color+'; stroke-width:1; fill:none;',
                fill: 'none',
                transform: 'translate(' + charOffset + ', 0)'
            });
            $word.append(charPath);
            var charBBox =  Raphael.pathBBox(path);
            
            charWidth = charBBox.width + charBBox.x;
            wordHeight = (charBBox.height + charBBox.y > wordHeight)?charBBox.height + charBBox.y:wordHeight;
            charOffset += charWidth + self.letterSpacing;
           
        }
       
        return {'$word':$word, 'width':charOffset, 'height':wordHeight};
        
    };
    
    HersheyReturns.prototype.renderLine = function(){
        var self = this;
        var wordOffset = 0;
        var lineHeight = 0;
        var $line =  $('<g>').attr({
            style: 'stroke:'+self.color+'; fill:none;',
        });
        
        while(self.wordCount < self.words.length){
            var word = self.words[self.wordCount];
            var gWord = self.renderWord(word);
            
            gWord.$word.attr({transform: 'translate(' + wordOffset + ', 0)'});
            
            if(wordOffset + gWord.width > self.width){
                if(gWord.width > self.width){
                    console.log('elem width too big');
                    return;
                }
                self.lines[self.lineCount] = {'$line':$line,'width':wordOffset, 'height':lineHeight};
                self.lineCount++;
                self.renderLine();
                return;
                
            }
            lineHeight = (gWord.height > lineHeight)?gWord.height:lineHeight;
            $line.append(gWord.$word);
            
            wordOffset += gWord.width + self.whiteSpace;
            self.wordCount++;
            
            
        }
        
        self.lines[self.lineCount] = {'$line':$line,'width':wordOffset, 'height':lineHeight};
        self.lineCount++;
        
    }
    
    HersheyReturns.prototype.render = function(){
        self = this;
        // Create central group
        var $group = $('<g>').attr({
        style: 'stroke:'+self.color+'; fill:none;',
        transform: 'translate('+self.pos.x+', '+self.pos.y+')'
        });
       
       
        var lineOffset = {'left':0, 'top':0};
        self.words = self.text.split(' ');
        
        
        self.lineCount = 0;
        self.wordCount = 0;
        self.lines = [];
        
        self.renderLine();
        
         for(var i = 0; i <  self.lineCount; i++){
            if(self.centerWidth){
                var lineWidth = self.lines[i].width;
                lineOffset.left = (self.width - lineWidth) / 2;
            }
            self.lines[i].$line.attr({transform: 'translate('+lineOffset.left+', '+lineOffset.top+')'});
            $group.append(self.lines[i].$line);
           
            if(i == self.lineCount - 1)
                lineOffset.top += self.lines[i].height;
            else
                lineOffset.top += self.charHeight + self.lineSpacing;
           
        }
        
        self.target.attr({'height':lineOffset.top});
        self.target.append($group);
        
        
        self.elem.append(this.target);
        self.elem.html(this.elem.html());
        
        
        
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
    
    //set letter spacing based on letter-spacing and scale of elem
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
