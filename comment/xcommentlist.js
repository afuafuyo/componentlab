/**
 * 评论列表控件
 */
function XCommentList(options) {
    this.doc = document;
    
    this.wrapper = null;
    this.filterWrapper = null;
    this.listWrapper = null;
    this.pageWrapper = null;
    this.replyForm = null;
    this.nowReplyId = 0;
    
    this.filterHtml =
'<div class="xcomment-list-header">' +
    '<a href="javascript:;" class="active" data-action="filterall">全部评论</a>' +
    '<a href="javascript:;" data-action="filterhot">按热度排序</a>' +
'</div>';

    this.listHtml =
'<% var list=data.comments; for(var i=0, len=list.length; i<len; i++){ %>' +
    '<div class="xcomment-relative xcomment-list-item">' +
        '<section class="xcomment-list-face">' +
            '<img class="xcomment-list-avatar" src="<%= list[i].avatar %>">' +
        '</section>' +
        '<section class="xcomment-list-content xcomment-list-content-toplayer">' +
            '<div class="xcomment-list-nick">' +
                '<a href="javascript:;"><%= list[i].nick %></a>' +
            '</div>' +
            '<div class="xcomment-list-text"><%= list[i].content %></div>' +
            '<div class="xcomment-list-widget">' +
                '<div class="xcomment-list-operation">' +
                    '<i class="xcomment-icon xcomment-icon-dot"></i>' +
                    '<div class="xcomment-list-operation-drop">' +
                        '<a class="xcomment-list-operation-drop-item" href="javascript:;" data-action="report" data-id="<%= list[i].id %>">举报</a>' +
                    '</div>' +
                '</div>' +
                '<span class="xcomment-list-widget-margin">#<%= list[i].floor %></span>' +
                '<span class="xcomment-list-widget-margin">来自<a href="javascript:;"><%= list[i].platform %></a></span>' +
                '<span class="xcomment-list-widget-margin"><%= list[i].posttime %></span>' +
                '<span class="xcomment-list-widget-prize xcomment-list-widget-margin" data-liked="<%= list[i].isliked %>" data-origin="<%= list[i].like %>" data-id="<%= list[i].id %>">' +
                    '<i data-action="like" class="xcomment-icon xcomment-icon-prize"></i>' +
                    '<span data-action="like"><%= list[i].like %></span>' +
                '</span>' +
                '<span class="xcomment-list-btn" data-action="reply" data-id="<%= list[i].id %>">回复</span>' +
            '</div>' +
            '<div data-role="replywrapper"></div>' +
        '</section>' +
        
        '<section class="xcomment-list-reply">' +
            '<% if(list[i].replies && list[i].replies.length > 0) { for(var x=0, l=list[i].replies.length; x<l; x++){ %>' +
            '<div class="xcomment-relative xcomment-list-reply-item">' +
                '<section class="xcomment-list-face">' +
                    '<img class="xcomment-list-avatar xcomment-list-reply-avatar" src="<%= list[i].replies[x].avatar %>">' +
                '</section>' +
                '<section class="xcomment-list-content-reply">' +
                    '<div class="xcomment-list-nick">' +
                        '<a href="javascript:;"><%= list[i].replies[x].nick %></a>' +
                    '</div>' +
                    '<div class="xcomment-list-text xcomment-list-reply-text"><%= list[i].replies[x].content %></div>' +
                    '<div class="xcomment-list-widget xcomment-list-reply-widget">' +
                        '<div class="xcomment-list-operation">' +
                            '<i class="xcomment-icon xcomment-icon-dot"></i>' +
                           '<div class="xcomment-list-operation-drop">' +
                                '<a class="xcomment-list-operation-drop-item" href="javascript:;" data-action="report" data-id="<%= list[i].replies[x].id %>">举报</a>' +
                            '</div>' +
                        '</div>' +
                        '<span class="xcomment-list-widget-margin"><%= list[i].replies[x].posttime %></span>' +
                        '<span class="xcomment-list-widget-prize xcomment-list-widget-margin" data-liked="<%= list[i].replies[x].isliked %>" data-origin="<%= list[i].replies[x].like %>" data-id="<%= list[i].replies[x].id %>">' +
                            '<i data-action="like" class="xcomment-icon xcomment-icon-prize"></i>' +
                            '<span data-action="like"><%= list[i].replies[x].like %></span>' +
                        '</span>' +
                        '<span class="xcomment-list-btn" data-action="reply" data-id="<%= list[i].replies[x].id %>">回复</span>' +
                    '</div>' +
                    '<div data-role="replywrapper"></div>' +
                '</section>' +
            '</div>' +
            '<% }} %>' +
        '</section>' +
        
    '</div>' +
'<% } %>';
    
    this.configs = {
        isLogin: false,
        onLogin: false,
        onReply: null,
        onReport: null,
        onLike: null,
        formAvatar: ''
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
        this.listWrapper.innerHTML = '<div class="xcomment-list-loading"><i></i></div>';
        
        // page
        this.pageWrapper = this.doc.createElement('div');
        this.pageWrapper.setAttribute('data-role', 'page');
        
        this.wrapper.appendChild(this.filterWrapper);
        this.wrapper.appendChild(this.listWrapper);
        this.wrapper.appendChild(this.pageWrapper);
    },
    bindEvent: function() {
        var _self = this;
        
        this.wrapper.onclick = function(e) {
            _self.handlerClick(e);
        };
    },
    // 点击事件
    handlerClick: function(e) {
        var target = e.target;
        var action = target.getAttribute('data-action');
        
        // filter
        if('filterall' === action || 'filterhot' === action) {
            this.onFilter(action);
            
            return;
        }
        
        // 喜欢
        if('like' === action) {
            var node = target.parentNode;
            var isLiked = node.getAttribute('data-liked');
            var originNumber = parseInt(node.getAttribute('data-origin'));
            
            // 去除喜欢
            if('1' === isLiked) {
                node.setAttribute('data-liked', '0');
                node.setAttribute('data-origin', String(originNumber - 1));
                node.querySelector('span').innerHTML = originNumber - 1;
            
            } else {
                node.setAttribute('data-liked', '1');
                node.setAttribute('data-origin', String(originNumber + 1));
                node.querySelector('span').innerHTML = originNumber + 1;
            }
            
            this.onLike('1' === isLiked ? '0' : '1', node.getAttribute('data-id'));
            
            return;
        }
        
        // 回复
        if('reply' === action) {
            var wrapper = target.parentNode.nextSibling;
            var id = target.getAttribute('data-id');
            
            // 如果没有 form 那么直接创建
            // 如果已经有 form 那么可能是销毁操作 或者 重新在其他评论下回复
            if(null === this.replyForm) {
                this.renderReplyForm(id, wrapper);
                
            } else {
                // 先销毁
                this.replyForm.destroy();
                this.replyForm = null;
                
                // 如果换了回复 那么需要重新在其下创建
                if(this.nowReplyId !== id) {
                    this.renderReplyForm(id, wrapper);
                }
            }
            
            this.nowReplyId = id;
            
            return;
        }
        
        // 举报
        if('report' === action) {
            var id = target.getAttribute('data-id');
            
            this.onReport(id);
            
            return;
        }
    },
    onFilter: function(action) {
        console.log('filter', action);
    },
    onLike: function(isLiked, id) {
        if(null !== this.configs.onLike) {
            this.configs.onLike(isLiked, id);
        }
    },
    onReply: function(v) {
        // this.replyForm.destroy();
        // this.replyForm = null;
        if(null !== this.configs.onReply) {
            this.configs.onReply(this.nowReplyId, v);
        }
    },
    onReport: function(id) {
        if(null !== this.configs.onReport) {
            this.configs.onReport(id);
        }
    },
    renderReplyForm: function(id, wrapper) {
        var _self = this;
        
        this.replyForm = new XCommentForm({
            isLogin: this.configs.isLogin,
            onLogin: this.configs.onLogin,
            avatar: this.configs.formAvatar,
            onSubmit: function(v) {
                _self.onReply(v);
            }
        });
        
        wrapper.appendChild(this.replyForm.getDom());
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
        var comments = data.comments;
        if(!comments) {
            this.listWrapper.innerHTML = '';
            return;
        }
        
        var html = this.template.run({
            comments: comments
        });
        
        this.listWrapper.innerHTML = html;
    }
};
