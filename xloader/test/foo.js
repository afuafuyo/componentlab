define('foo', ['foo.css'], function(css){

console.log('css:', css);

var Foo = function() {
    document.getElementById('demo').innerHTML = 'foo module';
};

return Foo;

});