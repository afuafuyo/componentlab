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
x.compile(html);

// 使用
var ret = x.run([1, 2, 3, 4, 5]);
console.log(ret);

// 编译完一次模板后 第二次使用不用再重新编译
ret = x.run([4, 5, 6]);
console.log(ret);
```
