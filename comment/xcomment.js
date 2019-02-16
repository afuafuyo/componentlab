/**
 * 评论组件
 */
'use strict';

function XComment(options) {
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
        avatar: 'https://i2.hdslb.com/bfs/face/b001dcba7b7d0de387abb9adefe4e409ba9e03f4.jpg@52w_52h.webp'
    };
    this.init(options);
}
XComment.prototype = {
    constructor: XComment,
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
                new XComment.widgetControllers[this.configs.widgets[i].name](item, this);
            
            
            this.widgetsWrapper.appendChild(item);
        }
        item = null;
    },
    initEvent: function() {
        var _self = this;
        
        // widgets
        this.widgetsWrapper.onmousedown = function() {
            return false;
        };
        this.widgetsWrapper.onclick = function(e) {
            _self.handlerWidgetClickEvent(e);
        };
        
        this.submitButton.onclick = function() {
            if(null === _self.configs.onSubmit) {
                return;
            }
            
            _self.configs.onSubmit(_self.getValue());
        }
    },
    deleteEvent: function() {
        this.widgetsWrapper.onmousedown = null;
        this.widgetsWrapper.onclick = null;
        this.submitButton.onclick = null;
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
        
        // 删除主发布器
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
XComment.event = (function() {

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
     */
    $insertEventBin: function(target, type, handler, thisObject) {
        var map = this.$eventBinMap;
        
        if(undefined === map[type]) {
            map[type] = [];
        }
        
        var eventBin = {
            target: target,
            type: type,
            handler: handler,
            thisObject: thisObject
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
            if(target === map[type][i].target) {
                map[type][i].handler.call(map[type][i].thisObject, e);
                
                break;
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
     */
    addEventListener: function(element, type, handler, thisObject) {
        var _self = this;
        
        if(undefined === thisObject) {
            thisObject = null;
        }
        
        // 避免重复绑定事件
        if(undefined === this.$eventBinMap[type]) {
            // Listen the specified event
            document.addEventListener(type, function(e) {
                _self.$eventProxy(e);
            }, false);
        }
        
        this.$insertEventBin(element, type, handler, thisObject);
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
XComment.widgetControllers = {};
XComment.registerWidgetController = function(name, processer) {
    XComment.widgetControllers[name] = processer;
};

/**
 * UI
 */
XComment.userInterfaces = {};
XComment.registerUI = function(name, processer) {
    XComment.userInterfaces[name] = processer;
}
XComment.getUI = function(name) {
    return new XComment.userInterfaces[name]().getDom();
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
XComment.registerUI('pop', XCommentUIPop);

/**
 * emotion widget
 */
function XCommentEmoji(button, xComment) {
    this.button = button;
    this.xComment = xComment;
    this.pop = null;
    
    this.init = function() {
        this.pop = XComment.getUI('pop');
        this.pop.innerHTML =
'<div class="xcomment-emoji-wrapper"><div class="xcomment-emoji-title">标题</div>' +
    '<div class="xcomment-emoji-content">' +
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
    '<div class="xcomment-emoji-footer">' +
        '<a href="javascript:;" class="active">颜文字</a>' +
    '</div></div>';

        var _self = this;
        this.pop.onclick = function(e) {
            _self.handlerPopClick(e);
        };
        
        XComment.event.addEventListener(document.body, 'click', this.handlerPopClose, this);
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
            XComment.event.removeEventListener(document.body, 'click', this.handlerPopClose);
        }
        
        this.pop = null;
        this.button = null;
        this.xComment = null;
    };
}
XComment.registerWidgetController('emoji', XCommentEmoji);


/**
 * list
 */
function XCommentList(options) {
    this.doc = document;
    
    this.wrapper = null;
    this.filterWrapper = null;
    this.listWrapper = null;
    
    this.filterHtml =
'<div class="xcomment-header">' +
    '<a href="javascript:;" class="active" data-action="filterall">全部评论</a>' +
    '<a href="javascript:;" data-action="filterhot">按热度排序</a>' +
'</div>';

    this.listHtml =
'<% var list=data.comments; for(var i=0, len=list.length; i<len; i++){ %>' +
    '<div class="xcomment-relative xcomment-item">' +
        '<section class="xcomment-face">' +
            '<img class="xcomment-avatar" src="<%= list[i].avatar %>">' +
        '</section>' +
        '<section class="xcomment-content xcomment-content-toplevel">' +
            '<div class="xcomment-nick">' +
                '<a href="javascript:;"><%= list[i].nick %></a>' +
            '</div>' +
            '<div class="xcomment-text"><%= list[i].content %></div>' +
            '<div class="xcomment-widget">' +
                '<div class="xcomment-operation">' +
                    '<i class="xcomment-icon xcomment-icon-dot"></i>' +
                    '<div class="xcomment-operation-drop">' +
                        '<a class="xcomment-operation-drop-item" href="javascript:;">举报</a>' +
                        '<a class="xcomment-operation-drop-item" href="javascript:;">加入黑名单</a>' +
                    '</div>' +
                '</div>' +
                '<span class="xcomment-widget-margin">#<%= list[i].floor %></span>' +
                '<span class="xcomment-widget-margin">来自<a href="javascript:;"><%= list[i].platform %></a></span>' +
                '<span class="xcomment-widget-margin"><%= list[i].posttime %></span>' +
                '<span class="xcomment-widget-prize xcomment-widget-margin" data-origin="<%= list[i].like %>" data-id="<%= list[i].id %>">' +
                    '<i data-action="like" class="xcomment-icon xcomment-icon-prize"></i>' +
                    '<span data-action="like"><%= list[i].like %></span>' +
                '</span>' +
                '<span class="xcomment-btn">回复</span>' +
            '</div>' +
        '</section>' +
        
        '<section class="xcomment-reply">' +
            '<% if(list[i].replies && list[i].replies.length > 0) { for(var x=0, l=list[i].replies.length; x<l; x++){ %>' +
            '<div class="xcomment-relative xcomment-reply-item">' +
                '<section class="xcomment-face">' +
                    '<img class="xcomment-avatar xcomment-reply-avatar" src="<%= list[i].replies[x].avatar %>">' +
                '</section>' +
                '<section class="xcomment-content xcomment-content-reply">' +
                    '<div class="xcomment-nick">' +
                        '<a href="javascript:;"><%= list[i].replies[x].nick %></a>' +
                        '<span class="xcomment-text xcomment-reply-text"><%= list[i].replies[x].content %></span>' +
                    '</div>' +
                    '<div class="xcomment-widget xcomment-reply-widget">' +
                        '<div class="xcomment-operation">' +
                            '<i class="xcomment-icon xcomment-icon-dot"></i>' +
                           '<div class="xcomment-operation-drop">' +
                                '<a class="xcomment-operation-drop-item" href="javascript:;">举报</a>' +
                                '<a class="xcomment-operation-drop-item" href="javascript:;">加入黑名单</a>' +
                            '</div>' +
                        '</div>' +
                        '<span class="xcomment-widget-margin"><%= list[i].replies[x].posttime %></span>' +
                        '<span class="xcomment-widget-prize xcomment-widget-margin" data-origin="<%= list[i].replies[x].like %>" data-id="<%= list[i].replies[x].id %>">' +
                            '<i data-action="like" class="xcomment-icon xcomment-icon-prize"></i>' +
                            '<span data-action="like"><%= list[i].replies[x].like %></span>' +
                        '</span>' +
                        '<span class="xcomment-btn">回复</span>' +
                    '</div>' +
                '</section>' +
            '</div>' +
            '<% }} %>' +
        '</section>' +
        
    '</div>' +
'<% } %>';
    
    this.configs = {
        onFilter: null,
        onLike: null
    };
    this.template = new XTemplate();
    
    this.init(options);
    this.bindEvent();
}

XCommentList.prototype = {
    constructor: XCommentList,
    init: function(options) {
        if(undefined !== options) {
            for(var k in options) {
                this.configs[k] = options[k];
            }
        }
        
        // template
        this.template.compile(this.listHtml);
        
        // wrapper
        this.wrapper = this.doc.createElement('div');
        
        // filter
        this.filterWrapper = this.doc.createElement('div');
        this.filterWrapper.setAttribute('data-role', 'filter');
        this.filterWrapper.innerHTML = this.filterHtml;
        
        // list
        this.listWrapper = this.doc.createElement('div');
        this.listWrapper.setAttribute('data-role', 'list');
        // 首次用 loading 填充 list
        this.listWrapper.innerHTML = '<div class="xcomment-loading"><i></i></div>';
        
        
        this.wrapper.appendChild(this.filterWrapper);
        this.wrapper.appendChild(this.listWrapper);
    },
    bindEvent: function() {
        var _self = this;
        
        this.wrapper.onclick = function(e) {
            _self.handlerClick(e);
        };
    },
    handlerClick: function(e) {
        var target = e.target;
        var action = target.getAttribute('data-action');
        
        // filter
        if('filterall' === action || 'filterhot' === action) {
            if(null !== this.configs.onFilter) {
                this.configs.onFilter(action);
            }
            
            return;
        }
        
        if('like' === action) {
            if(null !== this.configs.onLike) {
                this.configs.onLike(target.parentNode.getAttribute('data-id'));
            }
            
            return;
        }
    },
    
    /**
     * 获取 DOM
     */
    getDom: function() {
        return this.wrapper;
    },
    
    /**
     * 使用数据渲染列表
     */
    renderList: function(data) {
        var html = this.template.run(data);
        
        this.listWrapper.innerHTML = html;
    }
};