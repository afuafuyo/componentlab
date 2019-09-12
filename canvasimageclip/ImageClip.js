/**
 * canvas 图片裁剪
 *
 * @author afu
 *
 * @param {Element} canvas
 * @param {Object} options
 */
function ImageClip(canvas, options) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    
    // 图片信息
    this.image = new Image();
    this.originImageWidth = 0;
    this.originImageHeight = 0;
    this.scaleImageWidth = 0;
    this.scaleImageHeight = 0;
    this.aspectRatio = 1;
    
    // 裁剪移动信息
    this.inClipPath = false;
    this.beginMove = false;
    this.diffX = 0;
    this.diffY = 0;
    this.onChange = null;
    
    this.scaleClipWidth = 0;
    this.scaleClipHeight = 0;
    this.clipX = 0;
    this.clipY = 0;
    this.configs = {
        // 遮罩样式
        maskStyle: 'rgba(0, 0, 0, .6)',
        // 要裁剪的大小
        clipWidth: 100,
        clipHeight: 100
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
    isWideImage: function() {
        return this.originImageWidth >= this.originImageHeight;
    },
    
    
    drawImage: function() {
        // 宽图
        if(this.isWideImage()) {
            this.context.drawImage(
                this.image,
                0,
                (this.canvasHeight - this.scaleImageHeight) / 2,
                this.canvasWidth,
                this.scaleImageHeight
            );
        
        } else {
            this.context.drawImage(
                this.image,
                (this.canvasWidth - this.scaleImageWidth) / 2,
                0,
                this.scaleImageWidth,
                this.canvasHeight
            );
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
            this.scaleClipWidth,
            this.scaleClipHeight);
        this.context.stroke();
        // this.context.closePath();
        
        // clip view area
        this.context.clip();
        
        // view image
        this.drawImage();
        
        this.context.restore();
    },
    
    
    // 移动相关
    checkPath: function(e) {
        if(e.offsetX > this.clipX && e.offsetX < this.clipX + this.scaleClipWidth
            && e.offsetY > this.clipY && e.offsetY < this.clipY + this.scaleClipHeight) {
            
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
        var gap = 0;
        if(this.isWideImage()) {
            gap = (this.canvasHeight - this.scaleImageHeight) / 2;
            
            if(this.clipX <= 0) {
                this.clipX = 0;
            }
            if(this.clipX + this.scaleClipWidth >= this.canvasWidth) {
                this.clipX = this.canvasWidth - this.scaleClipWidth;
            }
            if(this.clipY <= gap) {
                this.clipY = gap;
            }
            if(this.clipY + this.scaleClipHeight + gap >= this.canvasHeight) {
                this.clipY = this.canvasHeight - gap - this.scaleClipHeight;
            }
            
        } else {
            gap = (this.canvasWidth - this.scaleImageWidth) / 2;
        
            if(this.clipX <= gap) {
                this.clipX = gap;
            }
            if(this.clipX + this.scaleClipWidth + gap >= this.canvasWidth) {
                this.clipX = this.canvasWidth - gap - this.scaleClipWidth;
            }
            if(this.clipY <= 0) {
                this.clipY = 0;
            }
            if(this.clipY + this.scaleClipHeight >= this.canvasHeight) {
                this.clipY = this.canvasHeight - this.scaleClipHeight;
            }
        }
        
        this.render();
        
        if(null !== this.onChange) {
            this.onChange(this.getClipPosition());
        }
    },
    
    
    /**
     * 裁剪图片
     *
     * @param {String} imageUrl
     */
    clip: function(imageUrl) {
        var _self = this;
        
        this.image.onload = function() {
            // 原大小
            _self.originImageWidth = this.width;
            _self.originImageHeight = this.height;
                        
            // 宽图按宽度占满 可能导致放大 Emmmmmm 写代码就是要为所欲为
            if(_self.isWideImage()) {
                _self.scaleImageWidth = _self.canvasWidth;
                _self.aspectRatio = _self.scaleImageWidth / _self.originImageWidth;
                _self.scaleImageHeight = _self.aspectRatio * _self.originImageHeight;
                
            } else {
                // 高图按高度占满
                _self.scaleImageHeight = _self.canvasHeight;
                _self.aspectRatio = _self.scaleImageHeight / _self.originImageHeight;
                _self.scaleImageWidth = _self.aspectRatio * _self.originImageWidth;
            }
            
            // 裁剪区大小
            _self.scaleClipWidth = _self.configs.clipWidth * _self.aspectRatio;
            _self.scaleClipHeight = _self.configs.clipHeight * _self.aspectRatio;
            
            // 裁剪位置定位在中心
            _self.clipX = (_self.canvasWidth - _self.scaleClipWidth) / 2;
            _self.clipY = (_self.canvasHeight - _self.scaleClipHeight) / 2;
            
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
    },
    
    
    getClipPosition: function() {
        var wideImage = this.isWideImage();
        var gap = wideImage
            ? (this.canvasHeight - this.scaleImageHeight) / 2
            : (this.canvasWidth - this.scaleImageWidth) / 2;
        
        return wideImage
            ? {
                x: this.clipX / this.aspectRatio,
                y: (this.clipY - gap) / this.aspectRatio,
                w: this.configs.clipWidth,
                h: this.configs.clipHeight
                
            } : {
                x: (this.clipX - gap) / this.aspectRatio,
                y: this.clipY / this.aspectRatio,
                w: this.configs.clipWidth,
                h: this.configs.clipHeight
            };
    },
    getPreview: function(startX, startY) {
        var doc = this.canvas.ownerDocument;
        var w = this.configs.clipWidth;
        var h = this.configs.clipHeight;
        var canvas = doc.createElement('canvas');
        var context = canvas.getContext('2d');
        
        canvas.width = w;
        canvas.height = h;
        context.drawImage(
            this.image,
            startX,
            startY,
            w,
            h,
            0,
            0,
            w,
            h
        );
        
        var base64 = canvas.toDataURL();
        
        context = null;
        canvas = null;
        doc = null;
        
        return base64;
    },
    /**
     * 销毁
     */
    destroy: function() {
        this.canvas.onmousemove = null;
        this.canvas.onmousedown = null;
        this.canvas.onmouseup = null;
        
        this.context = null;
        this.canvas = null;
        this.image = null;
        
        this.onChange = null;
        
        this.doc = null;
    }
};
