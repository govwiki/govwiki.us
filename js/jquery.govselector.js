(function($){
    $.govselector = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;
        
        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
        
        // Add a reverse reference to the DOM object
        base.$el.data("govselector", base);
        
        base.init = function(){
            base.options = $.extend({},$.govselector.defaultOptions, options);
            
            // Put your initialization code here
        };
        
        // Sample Function, Uncomment to use
        // base.functionName = function(paramaters){
        // 
        // };
        
        // Run initializer
        base.init();
    };
    
    $.govselector.defaultOptions = {
        rows: 5,
        template: "<b>{{}}</b>"
    };
    
    $.fn.govselector = function(options){
        return this.each(function(){
            (new $.govselector(this, options));
        });
    };
    
    // This function breaks the chain, but returns
    // the govselector if it has been attached to the object.
    $.fn.getgovselector = function(){
        this.data("govselector");
    };
    
})(jQuery);
