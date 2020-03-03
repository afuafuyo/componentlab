/**
 * 评论组件 连接 form 与 list 两个控件
 */
function Comment(configs) {
    this.doc = document;
    
    this.container = null;
    this.commentForm = null;
    this.commentList = null;
    
    this.configs = {
        isLogin: false,
        formAvatar: ''
    };
    
    this.init(configs);
}
Comment.prototype = {
    constructor: Comment,
    init: function(configs) {
        var _self = this;
        
        // configs
        if(undefined !== configs) {
            for(var k in configs) {
                this.configs[k] = configs[k];
            }
        }
        
        // form
        this.commentForm = new XCommentForm({
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
            onReport: function(id) {
                console.log('reply', id);
            },
            onReply: function(id, v) {
                console.log('reply', id, v);
            },
            onLike: function(isLiked, id) {
                console.log(isLiked, id);
            },
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
    render: function(containerId) {
        if(null === this.container) {
            this.container = this.doc.getElementById(containerId);
        }
        
        this.container.appendChild(this.commentForm.getDom());
        this.container.appendChild(this.commentList.getDom());
        
        this.fetchList(1);
    }
};
