/**
 * 评论 form 组件
 */
'use strict';

function XCommentForm(options) {
    this.doc = document;
    this.container = null;
    this.submitButton = null;
    this.avatarWrapper = null;
    this.contentWrapper = null;
    this.loginMask = null;
    this.textArea = null;
    this.widgetsWrapper = null;
    this.widgetControllerInstances = {};
    
    this.configs = {
        isLogin: false,
        onLogin: null,
        onSubmit: null,
        widgets: [{
            name: 'emoji',
            text: '表情'
        }],
        placeholder: '请自觉遵守互联网相关的政策法规，严禁发布色情、暴力、反动的言论。',
        avatar: ''
    };
    this.init(options);
}
XCommentForm.prototype = {
    constructor: XCommentForm,
    extend: function(origin, configs) {
        if(undefined === configs) {
            return origin;
        }
        
        for(var k in configs) {
            origin[k] = configs[k];
        }
        
        return origin;
    },
    init: function(options) {
        if(undefined !== options) {
            this.extend(this.configs, options);
        }
        
        // container
        this.container = this.doc.createElement('div');
        this.container.className = 'xcomment-relative xcomment-form';
                
        // avatar area
        this.avatarWrapper = this.doc.createElement('section');
        this.avatarWrapper.className = 'xcomment-form-face';
        this.avatarWrapper.innerHTML = '<img class="xcomment-form-avatar" src="'+ this.configs.avatar +'">';
        
        // content area
        this.initContentStructure();
        
        // widgets area
        this.initWidgetsStructure();
        
        // bind event
        this.initEvent();
        
        // combine
        this.container.appendChild(this.avatarWrapper);
        this.container.appendChild(this.contentWrapper);
        this.container.appendChild(this.widgetsWrapper);
    },
    initContentStructure: function() {
        this.contentWrapper = this.doc.createElement('section');
        this.contentWrapper.className = 'xcomment-relative xcomment-form-content';
        
        if(this.configs.isLogin) {
            this.textArea = this.doc.createElement('textarea');
            this.textArea.setAttribute('placeholder', this.configs.placeholder);
            this.textArea.className = 'xcomment-form-textarea';
            
            this.contentWrapper.appendChild(this.textArea);
            
            return;
        }
        
        this.loginMask = this.doc.createElement('div');
        this.loginMask.className = 'xcomment-form-content-login';
        this.loginMask.innerHTML = '你还没有登录，请&nbsp;<a href="javascript:;" data-action="login">登录</a>';
        
        this.contentWrapper.appendChild(this.loginMask);
    },
    initWidgetsStructure: function() {
        this.widgetsWrapper = this.doc.createElement('section');
        this.widgetsWrapper.className = 'xcomment-relative xcomment-form-widget';
        
        // submit button
        this.submitButton = this.doc.createElement('button');
        this.submitButton.setAttribute('type', 'button');
        if(!this.configs.isLogin) {
            this.submitButton.setAttribute('disabled', 'disabled');
        }
        this.submitButton.className = 'xcomment-form-btn';
        this.submitButton.innerHTML = '发表评论';
        this.widgetsWrapper.appendChild(this.submitButton);
        
        
        // 挂件
        if(!this.configs.isLogin) {
            return;
        }
        var item = null;
        for(var i=0, len=this.configs.widgets.length; i<len; i++) {
            item = this.doc.createElement('button');
            item.setAttribute('type', 'button');
            item.setAttribute('data-action', this.configs.widgets[i].name);
            item.className = 'xcomment-form-widget-item xcomment-form-widget-' + this.configs.widgets[i].name;
            item.innerHTML = this.configs.widgets[i].text;
            
            this.widgetControllerInstances[this.configs.widgets[i].name] =
                new XCommentForm.widgetControllers[this.configs.widgets[i].name](item, this);
            
            
            this.widgetsWrapper.appendChild(item);
        }
        item = null;
    },
    initEvent: function() {
        var _self = this;
        
        // widgets
        this.widgetsWrapper.onmousedown = function(e) {
            return false;
        };
        this.widgetsWrapper.onclick = function(e) {
            _self.handlerWidgetClickEvent(e);
        };
        
        // submit
        this.submitButton.onclick = function(e) {
            if(null === _self.configs.onSubmit) {
                return;
            }
            
            _self.configs.onSubmit(_self.getValue());
        }
        
        // login
        if(null !== this.loginMask) {
            this.loginMask.onclick = function(e) {
                var t = e.target;
                if('login' === t.getAttribute('data-action') && null !== _self.configs.onLogin) {
                    _self.configs.onLogin();
                }
            };
        }
    },
    deleteEvent: function() {
        this.widgetsWrapper.onmousedown = null;
        this.widgetsWrapper.onclick = null;
        this.submitButton.onclick = null;
        
        if(null !== this.loginMask) {
            this.loginMask.onclick = null;
        }
    },
    handlerWidgetClickEvent: function(e) {
        var target = e.target;
        
        var action = target.getAttribute('data-action');
        
        // 只有触发事件的对象才处理
        if(null === action) {
            return;
        }
        
        if(undefined === this.widgetControllerInstances[action]) {
            return;
        }
        
        if(undefined === this.widgetControllerInstances[action].onClick) {
            throw new Error('The widget: '+ action +' has no onClick method');
        }
        
        this.widgetControllerInstances[action].onClick(this);
    },
    
    /**
     * 获取 dom 对象
     */
    getDom: function() {
        return this.container;
    },
    clear: function() {
        if(null === this.textArea) {
            return;
        }
        
        this.textArea.value = '';
    },
    getValue: function() {
        if(null === this.textArea) {
            return '';
        }
        
        return this.textArea.value;
    },
    destroy: function() {
        // 先删除 widgets
        for(var widget in this.widgetControllerInstances) {
            if(undefined !== this.widgetControllerInstances[widget].destroy) {
                this.widgetControllerInstances[widget].destroy();
            }
        }
        this.widgetControllerInstances = null;
        
        // 删除事件
        this.deleteEvent();
        
        // widgets
        this.widgetsWrapper.innerHTML = '';
        this.submitButton = null;
        this.widgetsWrapper = null;
        
        // content
        this.contentWrapper.innerHTML = '';
        this.textArea = null;
        this.loginMask = null;
        this.contentWrapper = null;
        
        // avatar
        this.avatarWrapper = null;
        
        this.container.parentNode.removeChild(this.container);
        this.container = null;
    }
};

/**
 * Event
 */
XCommentForm.event = (function() {

var XEvent = function() {
    /**
     * {
     *    'click': [
     *      {
     *        target: 'Element',
     *        type: 'click',
     *        handler: 'fun',
     *        thisObject: 'obj'
     *      },
     *      ...
     *    ]
     * }
     */
    this.$eventBinMap = {};
};
XEvent.prototype = {
    constructor: XEvent,
    
    /**
     * 保存 event
     *
     * @param {Element} target
     * @param {String} type
     * @param {Function} handler
     * @param {Object} thisObject
     * @param {Boolean} allowBubbles
     */
    $insertEventBin: function(target, type, handler, thisObject, allowBubbles) {
        var map = this.$eventBinMap;
        
        if(undefined === map[type]) {
            map[type] = [];
        }
        
        var eventBin = {
            target: target,
            type: type,
            handler: handler,
            thisObject: thisObject,
            allowBubbles: allowBubbles
        };
        
        map[type].push(eventBin);
    },
    
    /**
     * 事件代理
     *
     * @param {Event} e
     */
    $eventProxy: function(e) {
        var target = e.target;
        var type = e.type;
        var map = this.$eventBinMap;
        
        if(undefined === map[type]) {
            return;
        }
        
        for(var i=0, len=map[type].length; i<len; i++) {
            // 点击源相符 或者 允许冒泡
            if(target === map[type][i].target || map[type][i].allowBubbles) {
                map[type][i].handler.call(map[type][i].thisObject, e);
                
                // 允许冒泡之后 可能同时有多个目标需要执行 所以不能 break
                // break;
            }
        }
    },
    
    /**
     * 添加事件监听
     *
     * @param {Element} element
     * @param {String} type
     * @param {Function} handler
     * @param {Object} thisObject
     * @param {Boolean} allowBubbles
     */
    addEventListener: function(element, type, handler, thisObject, allowBubbles) {
        var _self = this;
        
        if(undefined === thisObject) {
            thisObject = null;
        }
        if(undefined === allowBubbles) {
            allowBubbles = false;
        }
        
        // 避免重复绑定事件
        if(undefined === this.$eventBinMap[type]) {
            // Listen the specified event
            document.addEventListener(type, function(e) {
                _self.$eventProxy(e);
            }, false);
        }
        
        this.$insertEventBin(element, type, handler, thisObject, allowBubbles);
    },
    
    /**
     * 移除事件处理器
     *
     * @param {Element} element
     * @param {String} type
     * @param {Function} handler
     */
    removeEventListener: function(element, type, handler) {
        var map = this.$eventBinMap;
        
        if(undefined === map[type]) {
            return;
        }
        
        for(var i=0, len=map[type].length; i<len; i++) {
            if(element === map[type][i].target && handler === map[type][i].handler) {
                map[type].splice(i, 1);
                
                break;
            }
        }
    }
};

return new XEvent();

})();

/**
 * 部件容器
 *
 * {name: Function ...}
 *
 */
XCommentForm.widgetControllers = {};
XCommentForm.registerWidgetController = function(name, processer) {
    XCommentForm.widgetControllers[name] = processer;
};

/**
 * UI
 */
XCommentForm.userInterfaces = {};
XCommentForm.registerUI = function(name, processer) {
    XCommentForm.userInterfaces[name] = processer;
}
XCommentForm.getUI = function(name) {
    return new XCommentForm.userInterfaces[name]().getDom();
}

/**
 * Pop
 */
function XCommentUIPop() {
    this.wrapper = null;
    
    this.init();
}
XCommentUIPop.prototype = {
    constructor: XCommentUIPop,
    init: function() {
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'xcomment-form-pop';
    },
    getDom: function() {
        return this.wrapper;
    }
};
XCommentForm.registerUI('pop', XCommentUIPop);

/**
 * emotion widget
 */
function XCommentEmoji(button, xComment) {
    this.button = button;
    this.xComment = xComment;
    this.pop = null;
    
    this.init = function() {
        this.pop = XCommentForm.getUI('pop');
        this.pop.innerHTML =
'<div class="xcomment-form-widget-emoji-wrapper"><div class="xcomment-form-widget-emoji-title">标题</div>' +
    '<div class="xcomment-form-widget-emoji-content">' +
        '<a href="javascript:;" data-role="em" title="舒服" data-em="(￣▽￣)">(￣▽￣)</a>' +
        '<a href="javascript:;" data-role="em" title="高兴" data-em="(^_^)">(^_^)</a>' +
        '<a href="javascript:;" data-role="em" title="难过" data-em="(＞﹏＜)">(＞﹏＜)</a>' +
        '<a href="javascript:;" data-role="em" title="哼" data-em="(￣ヘ￣)">(￣ヘ￣)</a>' +
        '<a href="javascript:;" data-role="em" title="哭" data-em="(╥﹏╥)">(╥﹏╥)</a>' +
        '<a href="javascript:;" data-role="em" title="害怕" data-em="o((⊙﹏⊙))o">o((⊙﹏⊙))o</a>' +
        '<a href="javascript:;" data-role="em" title="赞" data-em="d===(￣▽￣*)b">d===(￣▽￣*)b</a>' +
        '<a href="javascript:;" data-role="em" title="爱你" data-em="(づ￣3￣)づ╭❤">(づ￣3￣)づ╭❤</a>' +
        '<a href="javascript:;" data-role="em" title="无奈" data-em="╮(╯＿╰)╭">╮(╯＿╰)╭</a>' +
        '<a href="javascript:;" data-role="em" title="惊讶" data-em="(⊙ˍ⊙)">(⊙ˍ⊙)</a>' +
        '<a href="javascript:;" data-role="em" title="汗" data-em="(-_-!)">(-_-!)</a>' +
        '<a href="javascript:;" data-role="em" title="强壮" data-em="ᕦ(ò_óˇ)ᕤ">ᕦ(ò_óˇ)ᕤ</a>' +
        '<a href="javascript:;" data-role="em" title="鄙视" data-em="→_→">→_→</a>' +
        '<a href="javascript:;" data-role="em" title="鄙视" data-em="←_←">←_←</a>' +
    '</div>' +
    '<div class="xcomment-form-widget-emoji-footer">' +
        '<a href="javascript:;" class="active">颜文字</a>' +
    '</div></div>';

        var _self = this;
        this.pop.onclick = function(e) {
            _self.handlerPopClick(e);
        };
        
        XCommentForm.event.addEventListener(document.body, 'click', this.handlerPopClose, this, true);
    };
    
    // 插入表情
    this.handlerPopClick = function(e) {
        if(e.stopPropagation) {
            e.stopPropagation();
        }
        
        var target = e.target;
        var role = target.getAttribute('data-role');
        
        var start = this.xComment.textArea.selectionStart;
        var end = this.xComment.textArea.selectionEnd;
        var value = this.xComment.textArea.value;
        
        // emoji
        if(null !== role && 'em' === role) {
            if('' === value) {
                this.xComment.textArea.value = target.getAttribute('data-em');
                
                return;
            }
            
            this.xComment.textArea.value = value.substring(0, start)
                + target.getAttribute('data-em')
                + value.substring(end);
        }
    };
    
    this.handlerPopClose = function(e) {
        var t = e.target;
        if('emoji' === t.getAttribute('data-action')) {
            return;
        }
        
        this.close();
    };
    
    this.close = function() {
        if(null !== this.xComment.widgetsWrapper.querySelector('.xcomment-form-pop')) {
            this.xComment.widgetsWrapper.removeChild(this.pop);
        }
    };
    
    this.render = function() {
        this.xComment.widgetsWrapper.appendChild(this.pop);
    };
    
    this.onClick = function(xComment) {        
        if(null === this.pop) {
            this.init();
        }
        
        this.render();
        xComment.textArea.focus();
    };
    
    this.destroy = function() {
        this.close();
        
        if(null !== this.pop) {
            this.pop.onclick = null;
            XCommentForm.event.removeEventListener(document.body, 'click', this.handlerPopClose);
        }
        
        this.pop = null;
        this.button = null;
        this.xComment = null;
    };
}
XCommentForm.registerWidgetController('emoji', XCommentEmoji);
