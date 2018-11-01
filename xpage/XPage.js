/**
 * 前端分页类
 *
 * @param {Number} totalRecords 记录总数
 * @param {Number} pageSize 分页大小
 *
 * var page = new XPage(12, 10);
 *
 * page.setConfig('showJump', true);
 *
 * page.onChange = function(currentPage, e) {
 *      console.log(currentPage);
 *      page.render(document.getElementById(mountNode));
 * };
 *
 * page.render(document.getElementById(mountNode));
 *
 */
function XPage(totalRecords, pageSize) {
    this.totalRecords = totalRecords;
    this.pageSize = pageSize;
    this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
    
    this.mountNode = null;
    this.currentPage = 1;
    this.onChange = null;
    this.config = {
        linkItemNumber: 7,
        
        showHome: true,
        showPrevious: true,
        showItem: true,
        showNext: true,
        showLast: true,
        showJump: true
    };
}
XPage.prototype = {
    constructor: XPage,
    setConfig: function(key, value) {
        this.config[key] = value;
    },
    getSegment: function(flag) {
        var str = '';
        switch(flag) {
            case 1:
                str = this.config.showJump
                    ? '<div class="x-page-jump">总共' + this.totalPages + '页，跳转到<input type="text" class="x-page-jump-input" />页</div>'
                    : '';
                break;
            case 2:
                str = this.config.showHome
                    ? '<a data-page="1" href="javascript:;" class="x-page-item">首页</a>'
                    : '';
                break;
            case 3:
                str = this.config.showPrevious
                    ? '<a data-page="'+ (this.currentPage-1) +'" href="javascript:;" class="x-page-item">上一页</a>'
                    : '';
                break;
            case 4:
                var half = Math.floor(this.config.linkItemNumber / 2);
                var counter = 0, tmp = '';
                
                for(var i=this.currentPage-half; i<this.currentPage; i++) {
                    i > 0 && (tmp += '<a data-page="'+ i +'" href="javascript:;" class="x-page-item">'+ i +'</a>', counter++);
                }
                tmp += '<span class="x-page-item x-page-active">'+ this.currentPage +'</span>';
                for(var i=this.currentPage+1; i<=this.currentPage+half+half-counter; i++) {
                    i <= this.totalPages && (tmp += '<a data-page="'+ i +'" href="javascript:;" class="x-page-item">'+ i +'</a>');
                }
            
                str = this.config.showItem ? tmp : '';
                break;
            case 5:
                str = this.config.showNext
                    ? '<a data-page="'+ (this.currentPage+1) +'" href="javascript:;" class="x-page-item">下一页</a>'
                    : '';
                break;
            case 6:
                str = this.config.showLast
                    ? '<a data-page="'+ this.totalPages +'" href="javascript:;" class="x-page-item">尾页</a>'
                    : '';
                break;
            default:
                break;
        }
        
        return str;
    },
    initPageEvent: function() {
        var _self = this;
        
        this.mountNode.onclick = null;
        this.mountNode.onclick = function(e) {
            e = e || window.event;
            var src = e.target || e.srcElement;
            
            if(1 === src.nodeType && 'A' === src.tagName.toUpperCase()) {
                _self.currentPage = parseInt(src.getAttribute('data-page'));
                _self.currentPage > _self.totalPages && (_self.currentPage = _self.totalPages);
                _self.currentPage < 1 && (_self.currentPage = 1);
                
                if(null !== _self.onChange) {
                    _self.onChange(_self.currentPage, e);
                }
            }
        };
    },
    getPageString: function(){
        var ret = '<div class="x-page">' +
            this.getSegment(1) +
            this.getSegment(2) +
            this.getSegment(3) +
            this.getSegment(4) +
            this.getSegment(5) +
            this.getSegment(6) +
            '</div>';
            
        return ret;
    },
    render: function(mountNode) {
        this.mountNode = mountNode;
        
        mountNode.innerHTML = this.getPageString();
        
        this.initPageEvent();
    }
};