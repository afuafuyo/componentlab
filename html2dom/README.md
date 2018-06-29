### html2dom

###### 把 html 片段转化为 dom 对象

```
var html =
`<div>
    <!-- html -->
    <h1>Hello</h1>
    <div>
        <div>zhangsan</div>
        <div>lisi</div>
        <div>20</div>
    </div>
</div>`;

var obj = new XDom();
obj.parse(html);

var dom = obj.getDom();
dom.querySelector('h1').onclick = function() {
    alert(this.innerHTML);
}

document.body.appendChild(dom);
```