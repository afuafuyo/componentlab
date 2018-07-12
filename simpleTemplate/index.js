/**
 * 简单 js 模板引擎
 *
 * eg.
 *
 * var html =
 * `
 * <div class="demo">
 *     <ul>
 *     <% for(var i=0; i<data.length; i++){ %>
 *     <li><%= data[i] %></li>
 *     <% } %>
 *     </ul>
 * </div>
 * `;
 *
 * var x = new XTemplate();
 * var cache = x.compile(html);
 * var ret = x.run([1, 2, 3, 4, 5]);
 * console.log(ret);
 *
 */
function XTemplate() {
    this.compiled = ['var tpl = "";'];
    this.jsRegex = /<%([\s\S]*?)%>/g;
}
XTemplate.prototype = {
    constructor: XTemplate,
    onText: function(text) {
        var t = 'tpl += "' + text + '";';
        
        this.compiled.push(t);
    },
    onJs: function(text) {        
        this.compiled.push(text);
    },
    onJsPlaceholder: function(text) {
        var t = 'tpl += ' + text + ';';
        
        this.compiled.push(t);
    },
    onEnd: function() {
        this.compiled.push('return tpl;');
    },
    processText: function(text) {
        return text.replace(/\r\n|\n/g, '\\n').replace(/"/g, '\\"');
    },
    compile: function(html) {
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
        
        return this.compiled;
    },
    run: function(data) {
        return new Function('data', this.compiled.join('\n'))(data);
    }
};
