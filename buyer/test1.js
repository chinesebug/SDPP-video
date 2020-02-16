var name = " the window";
var object = {
    name: " my object",
    getName: function(){
        var that = this
        return function(){
            return that.name;
        }
    }
}

console.log(object.getName()());