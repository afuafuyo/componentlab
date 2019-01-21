/**
 * XCommentMobile
 *
 * @param {} options
 */
var XCommentMobile = function(options) {
    this.doc = document;
    this.container = null;
    this.contentWrapper = null;
    this.textArea = null;
    this.widgetsWrapper = null;
    this.submitButton = null;
    this.widgetsPop = null;
    this.widgetControllerInstances = {};
    
    this.configs = {
        onSubmit: function() {},
        maxlength: 200,
        widgets: [{
            name: 'emoji',
            text: '颜文字'
        }, {
            name: 'image',
            text: '图片'
        }],
        placeholder: '请自觉遵守互联网相关的政策法规，严禁发布色情、暴力、反动的言论。'
    };
    this.init(options);
};
XCommentMobile.prototype = {
    constructor: XCommentMobile,
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
        this.container.className = 'mxcomment-relative mxcomment-form';
                
        // content
        this.initContentStructure();
        
        // widgets
        this.initWidgetsStructure();
        this.initWidgets();
        
        // bind event
        this.initEvent();
        
        // combine
        this.container.appendChild(this.contentWrapper);
        this.container.appendChild(this.widgetsWrapper);
    },
    initContentStructure: function() {
        this.contentWrapper = this.doc.createElement('section');
        this.contentWrapper.className = 'mxcomment-form-content';
        
        this.textArea = this.doc.createElement('textarea');
        this.textArea.setAttribute('placeholder', this.configs.placeholder);
        this.textArea.setAttribute('maxlength', this.configs.maxlength);
        this.textArea.className = 'mxcomment-form-textarea';
        
        this.contentWrapper.appendChild(this.textArea);
    },
    initWidgetsStructure: function() {
        this.widgetsWrapper = this.doc.createElement('section');
        this.widgetsWrapper.className = 'mxcomment-form-widget';
        
        // submit button
        this.submitButton = this.doc.createElement('button');
        this.submitButton.setAttribute('type', 'button');
        this.submitButton.className = 'mxcomment-form-btn';
        this.submitButton.innerHTML = '发表';
        
        this.widgetsPop = this.doc.createElement('div');
        this.widgetsPop.className = 'mxcomment-widgets-pop';
        this.widgetsPop.innerHTML = '<div class="mxcomment-widgets-pop-content"></div><div class="mxcomment-widgets-pop-footer"></div>';
        
        this.widgetsWrapper.appendChild(this.submitButton);
        this.widgetsWrapper.appendChild(this.widgetsPop);
    },
    initWidgets: function() {
        var popContentWrapper = this.widgetsPop.querySelector('.mxcomment-widgets-pop-content');
        var popFooterWrapper = this.widgetsPop.querySelector('.mxcomment-widgets-pop-footer');
        
        var tab = null;
        for(var i=0, len=this.configs.widgets.length; i<len; i++) {
            this.widgetControllerInstances[this.configs.widgets[i].name] =
                new XCommentMobile.widgetControllers[this.configs.widgets[i].name](this);
            
            tab = this.doc.createElement('a');
            
            if(0 === i) {
                tab.className = 'active';
                
                popContentWrapper.innerHTML = this.widgetControllerInstances[this.configs.widgets[i].name].getWidgetContent();
            }
            
            tab.setAttribute('href', 'javascript:;');
            tab.setAttribute('data-index', i);
            tab.setAttribute('data-role', 'widgetstab');
            tab.setAttribute('data-widgetname', this.configs.widgets[i].name);
            tab.innerHTML = this.configs.widgets[i].text;
            popFooterWrapper.appendChild(tab);
        }
        tab = null;
    },
    initEvent: function() {
        var _self = this;
        
        this.submitButton.onclick = function() {
            _self.configs.onSubmit(_self.getValue());
        }
        
        // 点击插件区
        this.widgetsPop.onclick = function(e) {
            var target = e.target;
            var popContentWrapper = _self.widgetsPop.querySelector('.mxcomment-widgets-pop-content');
            var footer = _self.widgetsPop.querySelector('.mxcomment-widgets-pop-footer');
            var tabs = footer.querySelectorAll('a');
            var nowTabIndex = 0;
            var instanceWidgets = _self.widgetControllerInstances;
            
            // 如果点击 tab
            if('widgetstab' === target.getAttribute('data-role')) {
                popContentWrapper.innerHTML
                    = _self.widgetControllerInstances[target.getAttribute('data-widgetname')].getWidgetContent();
                
                for(var i=0, len=tabs.length; i<len; i++) {
                    tabs[i].className = '';
                }
                
                target.className = 'active';
            }
            
            // 计算当前选中项
            for(var i=0, len=tabs.length; i<len; i++) {
                if(tabs[i].className.indexOf('active') >= 0) {
                    nowTabIndex = i;
                    
                    break;
                }
            }
            
            // 点击事件
            var name = _self.configs.widgets[nowTabIndex].name;
            if(undefined !== instanceWidgets[name].onClick) {
                instanceWidgets[name].onClick(e);
            }
        };
    },
    deleteEvent: function() {
        this.submitButton.onclick = null;
        this.widgetsPop.onclick = null;
    },
    
    /**
     * 获取 dom 对象
     */
    getDom: function() {
        return this.container;
    },
    clear: function() {
        this.textArea.value = '';
    },
    getValue: function() {
        return this.textArea.value;
    },
    destroy: function() {
        for(var widget in this.widgetControllerInstances) {
            if(undefined !== this.widgetControllerInstances[widget].destroy) {
                this.widgetControllerInstances[widget].destroy();
            }
        }
        this.widgetControllerInstances = null;
        
        // 删除主发布器
        this.deleteEvent();
        
        this.widgetsPop = null;
        this.submitButton = null;
        this.widgetsWrapper = null;
        this.textArea = null;
        this.contentWrapper = null;
        
        this.container.parentNode.removeChild(this.container);
        this.container = null;
    }
};

/**
 * 部件容器
 *
 * {name: Function ...}
 *
 */
XCommentMobile.widgetControllers = {};
XCommentMobile.registerWidgetController = function(name, processer) {
    XCommentMobile.widgetControllers[name] = processer;
};

/**
 * emoji widget
 */
function XCommentEmoji(xComment) {
    this.xComment = xComment;
    
    this.getWidgetContent = function() {
        var ret =
            '<div class="mxcomment-widgets-emoji">' +
                '<a href="javascript:;" data-role="em" title="舒服" data-em="(￣▽￣)">(￣▽￣)</a>' +
                '<a href="javascript:;" data-role="em" title="高兴" data-em="(^_^)">(^_^)</a>' +
                '<a href="javascript:;" data-role="em" title="难过" data-em="(＞﹏＜)">(＞﹏＜)</a>' +
                '<a href="javascript:;" data-role="em" title="哼" data-em="(￣ヘ￣)">(￣ヘ￣)</a>' +
                '<a href="javascript:;" data-role="em" title="哭" data-em="(╥﹏╥)">(╥﹏╥)</a>' +
                '<a href="javascript:;" data-role="em" title="滑稽" data-em="乛ᴗ乛">乛ᴗ乛</a>' +
                '<a href="javascript:;" data-role="em" title="害怕" data-em="o((⊙﹏⊙))o">o((⊙﹏⊙))o</a>' +
                '<a href="javascript:;" data-role="em" title="赞" data-em="d===(￣▽￣*)b">d===(￣▽￣*)b</a>' +
                '<a href="javascript:;" data-role="em" title="爱你" data-em="(づ￣3￣)づ❤">(づ￣3￣)づ❤</a>' +
                '<a href="javascript:;" data-role="em" title="无奈" data-em="╮(╯＿╰)╭">╮(╯＿╰)╭</a>' +
                '<a href="javascript:;" data-role="em" title="惊讶" data-em="(⊙ˍ⊙)">(⊙ˍ⊙)</a>' +
                '<a href="javascript:;" data-role="em" title="汗" data-em="(-_-!)">(-_-!)</a>' +
                '<a href="javascript:;" data-role="em" title="强壮" data-em="ᕦ(ò_óˇ)ᕤ">ᕦ(ò_óˇ)ᕤ</a>' +
                '<a href="javascript:;" data-role="em" title="鄙视" data-em="→_→">→_→</a>' +
                '<a href="javascript:;" data-role="em" title="鄙视" data-em="←_←">←_←</a>' +
            '</div>';

        return ret;
    };
    
    // insert emoji
    this.onClick = function(e) {
        var target = e.target;
        
        var start = this.xComment.textArea.selectionStart;
        var end = this.xComment.textArea.selectionEnd;
        var value = this.xComment.textArea.value;
        
        if('em' !== target.getAttribute('data-role')) {
            return;
        }
        
        // emoji
        if('' === value) {
            this.xComment.textArea.value = target.getAttribute('data-em');
            
            return;
        }
        
        this.xComment.textArea.value = value.substring(0, start)
            + target.getAttribute('data-em')
            + value.substring(end);
    };
    
    this.destroy = function() {
        this.xComment = null;
    };
}
XCommentMobile.registerWidgetController('emoji', XCommentEmoji);

/**
 * image widget
 */
function XCommentImage(xComment) {
    this.xComment = xComment;
    
    this.getWidgetContent = function() {
        var ret =
            '<div class="mxcomment-widgets-image">' +
                '<div><input class="mxcomment-widgets-image-input" type="text"></div>' +
                '<div class="mxcomment-widgets-image-btn-wrapper">' +
                    '<button type="button" data-action="imageinsert" class="mxcomment-widgets-image-btn">插入图片</button>' +
                '</div>' +
            '</div>';

        return ret;
    };
    
    // insert
    this.onClick = function(e) {
        var t = e.target;
        
        var start = this.xComment.textArea.selectionStart;
        var end = this.xComment.textArea.selectionEnd;
        var value = this.xComment.textArea.value;
        
        if('imageinsert' !== t.getAttribute('data-action')) {
            return;
        }
        
        var input = this.xComment.widgetsPop.querySelector('.mxcomment-widgets-image-input');
        
        if('' === input.value) {
            return;
        }
        
        // no data
        if('' === value) {
            this.xComment.textArea.value = '[img src="'+ input.value +'"]';
            
            return;
        }
        
        this.xComment.textArea.value = value.substring(0, start)
            + '[img src="'+ input.value +'"]'
            + value.substring(end);
    };
    
    this.destroy = function() {
        this.xComment = null;
    };
}
XCommentMobile.registerWidgetController('image', XCommentImage);