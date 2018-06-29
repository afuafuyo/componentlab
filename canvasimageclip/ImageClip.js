/**
 * canvas 图片裁剪
 *
 * @param {String} id
 * @param {Object} options
 */
function ImageClip(id, options) {
    this.doc = document;

    this.canvas = this.doc.getElementById(id);
    this.context = this.canvas.getContext('2d');
    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;
    
    this.image = new Image();
    this.imageOriginWidth = 0;
    this.imageOriginHeight = 0;
    this.imageScaleWidth = 0;
    this.imageScaleHeight = 0;
    this.aspectRatio = 1;
    
    this.inClipPath = false;
    this.beginMove = false;
    this.diffX = 0;
    this.diffY = 0;
    this.onChange = null;
    
    this.clipScaleWidth = 0;
    this.clipScaleHeight = 0;
    this.clipX = 0;
    this.clipY = 0;
    this.configs = {
        maskStyle: 'rgba(0, 0, 0, .6)',
        clipWidth: 200,
        clipHeight: 200
    };
    this.init(options);
}
ImageClip.prototype = {
    constructor: ImageClip,
    init: function(options) {
        if(undefined !== options) {
            for(var k in options) {
                this.configs[k] = options[k];
            }
        }
    },
    drawImage: function() {
        // 宽图
        if(this.imageOriginWidth >= this.imageOriginHeight) {
            this.context.drawImage(this.image,
                0, (this.canvasHeight - this.imageScaleHeight) / 2,
                this.canvasWidth, this.imageScaleHeight);
        
        } else {
            this.context.drawImage(this.image,
                (this.canvasWidth - this.imageScaleWidth) / 2, 0,
                this.imageScaleWidth, this.canvasHeight);
        }
    },
    render: function() {
        this.context.save();
        
        // clear
        this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // background image
        this.drawImage();
    
        // mask
        this.context.fillStyle = this.configs.maskStyle;
        this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // clip shape
        this.context.beginPath();
        this.context.strokeStyle = 'rgb(255, 255, 255)';
        // this.context.setLineDash([2, 10]);
        this.context.rect(
            this.clipX,
            this.clipY,
            this.clipScaleWidth,
            this.clipScaleHeight);
        this.context.stroke();
        // this.context.closePath();
        
        // clip
        this.context.clip();
        
        // view
        this.drawImage();
        
        this.context.restore();
    },
    checkPath: function(e) {
        if(e.offsetX > this.clipX && e.offsetX < this.clipX + this.clipScaleWidth
            && e.offsetY > this.clipY && e.offsetY < this.clipY + this.clipScaleHeight) {
            
            this.inClipPath = true;
            
            return;
        }
        
        this.inClipPath = false;
    },
    changePointer: function(e) {
        if(this.inClipPath/* this.context.isPointInPath(e.offsetX, e.offsetY) */) {
            this.canvas.style.cursor = 'move';
            
            return;
        }
        
        this.canvas.style.cursor = 'default';
    },
    moveClip: function(e) {
        if(!this.beginMove || !this.inClipPath) {
            return;
        }
        
        this.clipX = e.offsetX - this.diffX;
        this.clipY = e.offsetY - this.diffY;
        
        // 限制裁剪移动区域
        var tmp = 0;
        var wideImage = this.imageOriginWidth >= this.imageOriginHeight;
        if(wideImage) {
            tmp = (this.canvasHeight - this.imageScaleHeight) / 2;
            
            if(this.clipX <= 0) {
                this.clipX = 0;
            }
            if(this.clipX + this.clipScaleWidth >= this.canvasWidth) {
                this.clipX = this.canvasWidth - this.clipScaleWidth;
            }
            if(this.clipY <= tmp) {
                this.clipY = tmp;
            }
            if(this.clipY + this.clipScaleHeight + tmp >= this.canvasHeight) {
                this.clipY = this.canvasHeight - tmp - this.clipScaleHeight;
            }
            
        } else {
            tmp = (this.canvasWidth - this.imageScaleWidth) / 2;
        
            if(this.clipX <= tmp) {
                this.clipX = tmp;
            }
            if(this.clipX + this.clipScaleWidth + tmp >= this.canvasWidth) {
                this.clipX = this.canvasWidth - tmp - this.clipScaleWidth;
            }
            if(this.clipY <= 0) {
                this.clipY = 0;
            }
            if(this.clipY + this.clipScaleHeight >= this.canvasHeight) {
                this.clipY = this.canvasHeight - this.clipScaleHeight;
            }
        }
        
        this.render();
        
        if(null !== this.onChange) {
            this.onChange(wideImage ? {
                x1: this.clipX / this.aspectRatio,
                y1: (this.clipY - tmp) / this.aspectRatio,
                x2: (this.clipX + this.clipScaleWidth) / this.aspectRatio,
                y2: (this.clipY + this.clipScaleHeight - tmp) / this.aspectRatio
            } : {
                x1: (this.clipX - tmp) / this.aspectRatio,
                y1: this.clipY / this.aspectRatio,
                x2: (this.clipX + this.clipScaleWidth - tmp) / this.aspectRatio,
                y2: (this.clipY + this.clipScaleHeight) / this.aspectRatio
            });
        }
    },
    clip: function(imageUrl) {
        var _self = this;
        
        this.image.onload = function() {
            // 原大小
            _self.imageOriginWidth = this.width;
            _self.imageOriginHeight = this.height;
                        
            // 宽图按宽度占满
            if(_self.imageOriginWidth >= _self.imageOriginHeight) {
                _self.imageScaleWidth = _self.canvasWidth;
                _self.imageScaleHeight = _self.imageScaleWidth * _self.imageOriginHeight / _self.imageOriginWidth;
                
                _self.aspectRatio = _self.imageScaleWidth / _self.imageOriginWidth;
                
                // 裁剪大小
                _self.clipScaleWidth = _self.configs.clipWidth * _self.aspectRatio;
                _self.clipScaleHeight = _self.configs.clipHeight * _self.aspectRatio;
                
            } else {
                // 高图按高度占满
                _self.imageScaleHeight = _self.canvasHeight;
                _self.imageScaleWidth = _self.imageScaleHeight * _self.imageOriginWidth / _self.imageOriginHeight;
                
                _self.aspectRatio = _self.imageScaleHeight / _self.imageOriginHeight;
                
                // 裁剪大小
                _self.clipScaleHeight = _self.configs.clipHeight * _self.aspectRatio;
                _self.clipScaleWidth = _self.configs.clipWidth * _self.aspectRatio;
            }
            
            // 裁剪位置定位在中心
            _self.clipX = (_self.canvasWidth - _self.clipScaleWidth) / 2;
            _self.clipY = (_self.canvasHeight - _self.clipScaleHeight) / 2;
            
            // entry
            _self.render();
        };
        this.image.src = imageUrl;
        
        this.canvas.onmousemove = function(e) {
            _self.checkPath(e);
            _self.changePointer(e);
            _self.moveClip(e);
        };
        this.canvas.onmousedown = function(e) {
            _self.beginMove = true;
            
            _self.diffX = e.offsetX - _self.clipX;
            _self.diffY = e.offsetY - _self.clipY;
        };
        this.canvas.onmouseup = function(e) {
            _self.beginMove = false;
        };
    }
};
