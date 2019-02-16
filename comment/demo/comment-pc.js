/**
 * 评论组件
 */
function CommentAndList(containerId, configs) {
    this.doc = document;
    
    this.container = this.doc.getElementById(containerId);
    this.commentForm = null;
    this.commentList = null;
    
    this.configs = {
        isLogin: false
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
            onSubmit: function(v) {
                _self.postComment(v);
            }
        });
        
        // list
        this.commentList = new XCommentList({
            onFilter: function(action) {
                _self.filterList(action);
            },
            onLike: function(id) {
                _self.like(id);
            },
        });
    },
    postComment: function(v) {
        console.log(v);
    },
    filterList: function(action) {
        console.log(action)
    },
    like: function(id) {
        console.log(id)
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
                    content: '这是一个二级评',
                }, {
                    uid: 1,
                    nick: '展示那哈哈',
                    avatar: 'https://i2.hdslb.com/bfs/face/b001dcba7b7d0de387abb9adefe4e409ba9e03f4.jpg@52w_52h.webp',
                    id: 3,
                    floor: '3',
                    platform: 'IOS客户端',
                    posttime: '2018-01-01 12:12',
                    like: 10,
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
                content: '这是一个一级评论阿德发大水法阿斯顿发生大法是发生大法师大法是大法师大法上的发',
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