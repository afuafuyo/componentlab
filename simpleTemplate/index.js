/**
 * 简单 js 模板引擎
 *
 * eg.
 *
 * var html =
 * `
 * <div class="demo">
 *     <ul>
 *     <% for(var i=0; i<3; i++){ %>
 *     <li><%= i %></li>
 *     <% } %>
 *     </ul>
 * </div>
 * `;
 *
 * var x = new XTemplate();
 * var ret = x.parse(html, {});
 * console.log(ret)
 *
 */
function XTemplate() {
    this.ret = ['var tpl = "";'];
    this.jsRegex = /<%([\s\S]*?)%>/g;
}
XTemplate.prototype = {
    constructor: XTemplate,
    onText: function(text) {
        var t = 'tpl += "' + text + '";';
        
        this.ret.push(t);
    },
    onJs: function(text) {        
        this.ret.push(text);
    },
    onJsPlaceholder: function(text) {
        var t = 'tpl += ' + text + ';';
        
        this.ret.push(t);
    },
    onEnd: function() {
        this.ret.push('return tpl;');
    },
    processText: function(text) {
        return text.replace(/\r\n|\n/g, '\\n').replace(/"/g, '\\"');
    },
    parse: function(html, data) {
        var parts = null;
        // the index at which to start the next match
        var lastIndex = 0;
        
        while( null !== (parts = this.jsRegex.exec(html)) ) {
            // text
            if(parts.index > lastIndex) {
                var text = html.substring( lastIndex, parts.index );
                text = this.processText(text);

                this.onText(text);
            }
            lastIndex = this.jsRegex.lastIndex;
            
            var js = parts[1];
            if('=' === js.substring(0, 1)) {
                this.onJsPlaceholder(js.substring(1));
                
            } else {
                this.onJs(js);
            }
        }
        
        // 最后剩余 text
        this.onText( this.processText(html.substring(lastIndex)) );
        this.onEnd();
        
        return new Function('data', this.ret.join('\n'))(data);
    },
};
