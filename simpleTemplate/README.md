## 简单模板引擎

### 使用方法

```
var html =
`
<div class="demo">
    <ul>
    <% for(var i=0; i<3; i++){ %>
    <li><%= i %></li>
    <% } %>
    </ul>
</div>
`;

var x = new XTemplate();
var ret = x.parse(html, {});
console.log(ret)
```