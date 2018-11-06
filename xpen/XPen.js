/**
 * 画笔
 */
'use strict';

function XPen() {
    this.doc = document;
    this.canvas = null;
    this.context = null;
    this.wrapper = null;
    this.id = 'xpen';
        
    this.dragIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAaAQMAAAC5NC8iAAAABlBMVEVBQUH///8n5gi1AAAAEklEQVQI12PABJINQESKCAIAAIrzA5frDsdRAAAAAElFTkSuQmCC';
    this.clearIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAaCAMAAACw0Z1uAAAARVBMVEUAAABIPTpFODdBOTdKPDVBNzQ+NTJLQT5IQT5CPTpGPDlMPTZHODJPRUNVTEhMSERDQ0NFPzxOQDtMPTo+PDdENS9OQ0C/kZGyAAAAAXRSTlMAQObYZgAAAGhJREFUGNO9ju0KgCAMRa9fSy0z03r/R80Ng6Dfdbg4DtfB8C3Gm7OYIUlbHnZfeHhSy2x7jnnDi0wh69D02qK0HphGmAIoiRMNgBZNosTKlWHjt0obH5/p3k2O76n9DAg+uqgmWvEjFybWAqaOOBO+AAAAAElFTkSuQmCC';
    this.colors = [
        '#000',
        '#f00',
        '#bd5151',
        '#499495',
        '#91abe1',
        '#1c74aa',
        '#f0f',
        '#666'
    ];
    this.colorElements = null;
    this.penColor = this.colors[0];
    this.penWidth = 2;
    
    this.init();
    this.initEvent();
}
XPen.prototype = {
    constructor: XPen,
    setStyle: function(element, styles) {
        for(var k in styles) {
            element.style[k] = styles[k];
        }
    },
    init: function() {
        // wrapper
        this.wrapper = this.doc.createElement('div');
        this.setStyle(this.wrapper, {
            position: 'absolute',
            bottom: '100px',
            left: '20px',
            zIndex: 1120,
            height: '26px',
            backgroundColor: '#fff',
            boxShadow: '0px 0px 15px #666',
            border: '1px solid #666',
            borderRadius: '3px'
        });
        
        // drag
        var drag = this.doc.createElement('div');
        this.setStyle(drag, {
            float: 'left',
            width: '12px',
            height: '100%',
            background: 'url('+ this.dragIcon +') no-repeat 0 0'
        });
        
        // colors
        var color = this.doc.createElement('div');
        this.setStyle(color, {
            float: 'left',
            height: '18px',
            marginTop: '4px',
            marginLeft: '10px'
        });
        for(var colorElement=null,i=0,len=this.colors.length; i<len; i++) {
            colorElement = this.doc.createElement('a');
            this.setStyle(colorElement, {
                display: 'inline-block',
                position: 'relative',
                top: '0',
                width: '18px',
                height: '100%',
                backgroundColor: this.colors[i]
            });
            colorElement.setAttribute('data-color', this.colors[i]);
            colorElement.setAttribute('data-role', 'color');
            color.appendChild(colorElement);
        }
        this.colorElements = color.querySelectorAll('a');
        
        // clear
        var clear = this.doc.createElement('a');
        clear.setAttribute('href', 'javascript:;');
        clear.setAttribute('data-role', 'clear');
        this.setStyle(clear, {
            display: 'block',
            float: 'left',
            width: '26px',
            height: '100%',
            marginLeft: '2px',
            background: 'url('+ this.clearIcon +') no-repeat center 0'
        });
        
        // close
        var close = this.doc.createElement('a');
        close.setAttribute('href', 'javascript:;');
        close.setAttribute('data-role', 'close');
        close.innerHTML = '&times;';
        this.setStyle(close, {
            display: 'block',
            float: 'left',
            width: '26px',
            height: '100%',
            color: '#333',
            fontSize: '18px',
            textAlign: 'center',
            textDecoration: 'none'
        });
        
        // canvas
        this.canvas = this.doc.createElement('canvas');
        this.canvas.setAttribute('width', this.doc.documentElement.clientWidth);
        this.canvas.setAttribute('height', this.doc.documentElement.clientHeight);
        this.setStyle(this.canvas, {
            position: 'fixed',
            zIndex: 1100,
            top: 0,
            left: 0,
            cursor: 'crosshair'
        });
        this.context = this.canvas.getContext('2d');
        
        this.wrapper.appendChild(drag);
        this.wrapper.appendChild(color);
        this.wrapper.appendChild(clear);
        this.wrapper.appendChild(close);
    },
    initEvent: function() {
        var _self = this;
        
        // set color
        this.wrapper.onmousemove = function(e) {
            var t = e.target;
            var role = t.getAttribute('data-role');
            
            if('color' === role) {
                _self.hoverColor(e);
            }
        };
        
        // click
        this.wrapper.onclick = function(e) {
            var t = e.target;
            var role = t.getAttribute('data-role');
            
            if('clear' === role) {
                _self.context.clearRect(0, 0, _self.canvas.width, _self.canvas.height);
                
                return;
            }
            
            if('close' === role) {
                _self.close();
            }
        };
        
        // draw
        this.canvas.onmousedown = function(e) {
            _self.canvasMouseDown(e);
        };
    },
    hoverColor: function(e) {
        var t = e.target;
    
        for(var i=0, len=this.colorElements.length; i<len; i++) {
            this.colorElements[i].style.top = '0';
        }
        
        t.style.top = '-2px';
        
        this.penColor = t.getAttribute('data-color');
    },
    canvasMouseDown: function(e) {
        var _self = this;
        
        var x = e.clientX;
        var y = e.clientY;
        
        this.context.beginPath();
        this.context.moveTo(x, y);
        
        this.canvas.onmousemove = function(e) {
            _self.drawLine(e);
        };
        this.canvas.onmouseup = function(e) {
            _self.canvas.onmousemove = null;
        };
    },
    drawLine: function(e) {
        var x = e.clientX;
        var y = e.clientY;
        
        this.context.strokeStyle = this.penColor;
        this.context.lineWidth = this.penWidth;
        this.context.lineTo(x, y);
        this.context.stroke();
    },
    close: function() {
        this.doc.body.removeChild(this.canvas);
        this.doc.body.removeChild(this.wrapper);
    },
    render: function() {
        this.doc.body.appendChild(this.wrapper);
        this.doc.body.appendChild(this.canvas);
    }
};
