## 简单模板引擎

### 使用方法

```
var html =
`
<div class="demo">
    <ul>
    <% for(var i=0; i<data.length; i++){ %>
    <li><%= data[i] %></li>
    <% } %>
    </ul>
</div>
`;

var x = new XTemplate();
var cache = x.compile(html);
var ret = x.run([1, 2, 3, 4, 5]);
console.log(ret);

// 缓存
x.compiled = cache;
ret = x.run([4, 5, 6]);
console.log(ret);
```
