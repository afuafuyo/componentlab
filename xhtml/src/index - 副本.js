/**
 * XHtml
 */
function XHtml() {
    this.doc = document;
    this.dom = null;

    // <(xxx)( data-name="lisi") xxx />
    // </(xxx)>
    // <!--(xxx)-->
    // 此正则有四个子模式
    // 1. 代表开始标签名称
    // 2. 代表整个属性部分
    // 3. 代表结束标签名称
    // 4. 代表注释内容
    this.htmlPartsRegex = /<(?:(?:(\w+)((?:\s+[\w\-:]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)[\S\s]*?\/?>)|(?:\/([^>]+)>)|(?:!--([\S|\s]*?)-->))/g;

    // (title)="()"
    this.attributesRegex = /([\w\-:]+)\s*=\s*(?:(?:"([^"]*)")|(?:'([^']*)')|([^>\s]+))/g;
    
    this.resetStack();
}
XHtml.prototype = {
    constructor: XHtml,
    
    resetStack: function() {
        this.lookingBackTagstack = new XStack();
        
        // 初始放入一个顶级容器
        var node = this.doc.createElement('div');
        node.setAttribute('data-role', 'xhtml-wrapper');
        this.lookingBackTagstack.push(node);
        
        node = null;
    },

    onText: function(text) {
        var node = this.doc.createTextNode(text);

        this.lookingBackTagstack.getTail().appendChild(node);
    },

    onClose: function(tagName) {
        this.dom = this.lookingBackTagstack.pop();
    },

    onOpen: function(tagName, attributes) {
        tagName = tagName.toLowerCase();

        var node = this.doc.createElement(tagName);
        for(var k in attributes) {
            node.setAttribute(k, attributes[k]);
        }

        //if(null !== this.lookingBackTagstack.getTail()
        //        && node !== this.lookingBackTagstack.getTail()) {
            this.lookingBackTagstack.getTail().appendChild(node);
        //}

        // 开始标签入栈 可以作为父容器使用
        if(1 !== XHtml.selfClosingTags[tagName]) {
            this.lookingBackTagstack.push(node);
        }
    },

    onComment: function(content) {
        var node = this.doc.createComment(content);

        this.lookingBackTagstack.getTail().appendChild(node);
    },

    /**
     * 解析 html
     *
     * @param {String} html
     */
    parse: function(html) {
        var parts = null;
        // the index at which to start the next match
        var lastIndex = 0;
        var tagName = '';

        while( null !== (parts = this.htmlPartsRegex.exec(html)) ) {
            // TextNode
            if(parts.index > lastIndex) {
                var text = html.substring( lastIndex, parts.index );

                this.onText(text);
            }
            lastIndex = this.htmlPartsRegex.lastIndex;

            // closing tag
            if( (tagName = parts[3]) ) {
                this.onClose(tagName);

                continue;
            }

            // opening tag & selfClosingTag
            if( (tagName = parts[1]) ) {

                var attrParts = null;
                var attrs = {};

                // attributes
                if(parts[2]) {
                    while ( null !== ( attrParts = this.attributesRegex.exec(parts[2]) ) ) {
                        var attrName = attrParts[1];
                        var attrValue = attrParts[2] || attrParts[3] || attrParts[4] || '';

                        if(XHtml.emptyAttributes[attrName]) {
                            attrs[attrName] = attrName;

                        } else {
                            attrs[attrName] = attrValue;
                        }
                    }
                }

                this.onOpen(tagName, attrs);

                continue;
            }

            // comment
            if( (tagName = parts[4]) ) {
                this.onComment(tagName);
            }
        }
    },

    /**
     * 获取 dom
     */
    getDom: function() {
        return this.dom;
    }
};

/**
 * 自闭和标签
 */
XHtml.selfClosingTags = {
    meta: 1,
    base: 1,
    link: 1,
    hr: 1,
    br: 1,
    wbr: 1,
    col: 1,
    img: 1,
    area: 1,
    input: 1,
    textarea: 1,
    embed: 1,
    param: 1,
    source: 1,
    object: 1
};

/**
 * 可以为空的属性
 */
XHtml.emptyAttributes = {
    checked: 1,
    compact: 1,
    declare: 1,
    defer: 1,
    disabled: 1,
    ismap: 1,
    multiple: 1,
    nohref: 1,
    noresize: 1,
    noshade: 1,
    nowrap: 1,
    readonly: 1,
    selected: 1
};

/**
 * Stack
 */
function XStack() {
    this.headNode = null;
    this.tailNode = null;
    this.size = 0;
}
XStack.prototype = {
    constructor: XStack,

    push: function(data) {
        var node = new XStackNode(data, null, null);

        if(0 === this.size) {
            this.headNode = node;

        } else {
            this.tailNode.next = node;
            node.prev = this.tailNode;
        }

        this.tailNode = node;

        this.size++;
    },

    pop: function() {
        var ret = this.tailNode.data;

        if(0 === this.size) {
            return null;
        }
        if(1 === this.size) {
            this.headNode = this.tailNode = null;
            this.size--;

            return ret;
        }

        this.tailNode = this.tailNode.prev;
        this.tailNode.next.prev = null;
        this.tailNode.next = null;
        this.size--;

        return ret;
    },

    getTail: function() {
        return null === this.tailNode ? null : this.tailNode.data;
    },

    clear: function() {
        while(0 !== this.size) {
            this.pop();
        }
    },

    toString: function() {
        var str = '[ ';

        for(var current = this.headNode; null !== current; current = current.next) {
            str += current.data + ' ';
        }

        return str + ' ]';
    }
};

/**
 * Node
 */
function XStackNode(data, prev, next) {
    this.data = data;
    this.prev = prev;
    this.next = next;
}