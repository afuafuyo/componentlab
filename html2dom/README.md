### html 过滤库

###### 过滤 html 标签及属性

```
var html =
`
<div>
    <h1>Hello</h1>
    <div id="user" onclick="alert(1)">
        <p>zhangsan</p>
        <p>male</p>
        <p>20</p>
    </div>
</div>
`;

// 1. 转 dom 对象 translate to dom object
var obj = new XHtml();
obj.parse(html);

var dom = obj.getDom();
dom.querySelector('h1').onclick = function() {
    alert(this.innerHTML);
}
document.body.appendChild(dom);


// 2. 过滤标签和属性 filter tags & attributes
obj.resetStack();
obj.allowedTags = {div: true, p: true};
obj.allowedAttributes = {id: true};
obj.parse(html);
console.log(obj.getHtml());
```