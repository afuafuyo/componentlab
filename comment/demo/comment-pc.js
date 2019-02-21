/**
 * 评论组件
 */
function CommentAndList(containerId, configs) {
    this.doc = document;
    
    this.container = this.doc.getElementById(containerId);
    this.commentForm = null;
    this.commentList = null;
    
    this.configs = {
        isLogin: false,
        formAvatar: ''
    };
    
    this.init(configs);
}
CommentAndList.prototype = {
    init: function(configs) {
        var _self = this;
        
        // configs
        if(undefined !== configs) {
            for(var k in configs) {
                this.configs[k] = configs[k];
            }
        }
        
        // form
        this.commentForm = new XComment({
            isLogin: this.configs.isLogin,
            avatar: this.configs.formAvatar,
            onLogin: function() {
                _self.login();
            },
            onSubmit: function(v) {
                _self.postComment(v);
            }
        });
        
        // list
        this.commentList = new XCommentList({
            isLogin: this.configs.isLogin,
            formAvatar: this.configs.formAvatar,
            onLogin: function() {
                _self.login();
            }
        });
    },
    login: function() {
        console.log('login');
    },
    postComment: function(v) {
        console.log(v);
    },
    like: function(isLiked, id) {
        console.log(isLiked, id)
    },
    reply: function(id, content) {
        console.log(id, content)
    },
    fetchList: function(page) {
        this.commentList.renderList({
            comments: [{
                uid: 1,
                nick: '展示那哈哈',
                avatar: 'https://i2.hdslb.com/bfs/face/b001dcba7b7d0de387abb9adefe4e409ba9e03f4.jpg@52w_52h.webp',
                id: 129,
                floor: '3',
                platform: '安卓客户端',
                posttime: '2018-01-01 12:12',
                like: 1000,
                isliked: 1,
                content: '这是一个一级评论阿德发大水法',
                replies: [{
                    uid: 1,
                    nick: '展示那哈哈',
                    avatar: 'https://i2.hdslb.com/bfs/face/b001dcba7b7d0de387abb9adefe4e409ba9e03f4.jpg@52w_52h.webp',
                    id: 2,
                    floor: '3',
                    platform: 'PC',
                    posttime: '2018-01-01 12:12',
                    like: 80,
                    isliked: 0,
                    content: '这是一个二级评999999999999999',
                }, {
                    uid: 1,
                    nick: '展示那哈哈',
                    avatar: 'https://i2.hdslb.com/bfs/face/b001dcba7b7d0de387abb9adefe4e409ba9e03f4.jpg@52w_52h.webp',
                    id: 3,
                    floor: '3',
                    platform: 'IOS客户端',
                    posttime: '2018-01-01 12:12',
                    like: 10,
                    isliked: 1,
                    content: '这是一个2及评论阿德发大水法',
                }]
            }, {
                uid: 1,
                nick: '展示那哈哈',
                avatar: 'https://i2.hdslb.com/bfs/face/b001dcba7b7d0de387abb9adefe4e409ba9e03f4.jpg@52w_52h.webp',
                id: 5,
                floor: '3',
                platform: '安卓客户端',
                posttime: '2018-01-01 12:12',
                like: 30,
                isliked: 0,
                content: '222这是一个一级评论阿德发大水法阿斯顿发生大法是发生大法师大法是大法师大法上的发',
                replies: []
            }, {
                uid: 1,
                nick: '展示那哈哈',
                avatar: 'https://i2.hdslb.com/bfs/face/b001dcba7b7d0de387abb9adefe4e409ba9e03f4.jpg@52w_52h.webp',
                id: 90,
                floor: '3',
                platform: '安卓客户端',
                posttime: '2018-01-01 12:12',
                like: 200,
                isliked: 1,
                content: '这是一个一级评论阿德发大水法阿斯顿发生大法是发生大法师大法是大法师大法上的发',
                replies: []
            }]
        });
    },
    render: function() {
        this.container.appendChild(this.commentForm.getDom());
        this.container.appendChild(this.commentList.getDom());
        
        this.fetchList(1);
    }
};


/**
 * list
 */
function XCommentList(options) {
    this.doc = document;
    
    this.wrapper = null;
    this.filterWrapper = null;
    this.listWrapper = null;
    this.replyForm = null;
    this.nowReplyId = 0;
    
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
                        '<a class="xcomment-operation-drop-item" href="javascript:;" data-action="report" data-id="<%= list[i].id %>">举报</a>' +
                    '</div>' +
                '</div>' +
                '<span class="xcomment-widget-margin">#<%= list[i].floor %></span>' +
                '<span class="xcomment-widget-margin">来自<a href="javascript:;"><%= list[i].platform %></a></span>' +
                '<span class="xcomment-widget-margin"><%= list[i].posttime %></span>' +
                '<span class="xcomment-widget-prize xcomment-widget-margin" data-liked="<%= list[i].isliked %>" data-origin="<%= list[i].like %>" data-id="<%= list[i].id %>">' +
                    '<i data-action="like" class="xcomment-icon xcomment-icon-prize"></i>' +
                    '<span data-action="like"><%= list[i].like %></span>' +
                '</span>' +
                '<span class="xcomment-btn" data-action="reply" data-id="<%= list[i].id %>">回复</span>' +
            '</div>' +
            '<div data-role="replywrapper"></div>' +
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
                                '<a class="xcomment-operation-drop-item" href="javascript:;" data-action="report" data-id="<%= list[i].replies[x].id %>">举报</a>' +
                            '</div>' +
                        '</div>' +
                        '<span class="xcomment-widget-margin"><%= list[i].replies[x].posttime %></span>' +
                        '<span class="xcomment-widget-prize xcomment-widget-margin" data-liked="<%= list[i].replies[x].isliked %>" data-origin="<%= list[i].replies[x].like %>" data-id="<%= list[i].replies[x].id %>">' +
                            '<i data-action="like" class="xcomment-icon xcomment-icon-prize"></i>' +
                            '<span data-action="like"><%= list[i].replies[x].like %></span>' +
                        '</span>' +
                        '<span class="xcomment-btn" data-action="reply" data-id="<%= list[i].replies[x].id %>">回复</span>' +
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
            
            // 更新数量
            if('1' === isLiked) {
                node.setAttribute('data-liked', '0');
                node.setAttribute('data-origin', String(originNumber - 1));
                node.querySelector('span').innerHTML = originNumber - 1;
            
            } else {
                node.setAttribute('data-liked', '1');
                node.setAttribute('data-origin', String(originNumber + 1));
                node.querySelector('span').innerHTML = originNumber + 1;
            }
            
            this.onLike(isLiked, node.getAttribute('data-id'));
            
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
        console.log('praise', isLiked, id);
    },
    onReply: function(v) {
        // this.replyForm.destroy();
        // this.replyForm = null;
        
        console.log('reply', this.nowReplyId, v);
    },
    onReport: function(id) {
        console.log('report', id);
    },
    renderReplyForm: function(id, wrapper) {
        var _self = this;
        
        this.replyForm = new XComment({
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
        var html = this.template.run(data);
        
        this.listWrapper.innerHTML = html;
    }
};