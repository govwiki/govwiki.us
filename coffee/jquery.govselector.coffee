(($) ->

  $.govselector = (el, options) ->

    # To avoid scope issues, use 'base' instead of 'this'
    # to reference this class from internal events and functions.
    base = this
    
    
    # Access to jQuery and DOM versions of element
    base.$el = $(el)
    base.el = el
    
    
    # Add a reverse reference to the DOM object
    base.$el.data 'govselector', base

    # delay usage
    #$('input').keyup ->
    #  delay (-> alert 'Time elapsed!'; return), 1000
    #  return
      
    delay = do ->
      timer = 0
      (callback, ms) ->
        clearTimeout timer
        timer = setTimeout(callback, ms)
        return
    
    onkeyup = (event) ->
      switch  event.which
        # Enter
        when 13
          event.preventDefault()
          $('.typeahead').typeahead 'val', base.$el.val()
          $('.typeahead').typeahead 'open'
        # Esc
        when 27
          $('.typeahead').typeahead 'close'
        # Up
        when 38 then
        # Down
        when 40 then
        else
          $('.typeahead').typeahead 'val', base.$el.val()
          $('.typeahead').typeahead 'open'
      #event.preventDefault()
      console.log event.which
      return

    blur = (event) ->
      console.log 'blur'
    
    base.init = ->
      base.options = $.extend({}, $.govselector.defaultOptions, options)
      # Put your initialization code here
      base.$el.css 'background-color', 'white'
      base.$el.keyup onkeyup
      base.$el.blur onblur

      return

    
    # Sample Function, Uncomment to use
    # base.functionName = function(paramaters){
    #
    # };
    
    
    # Run initializer
    base.init()
    return

    
  $.govselector.defaultOptions =
    rows: 5
    template: '{{}}'

    
  $.fn.govselector = (options) ->
    @each ->
      new ($.govselector)(this, options)
      return

    
  # This function breaks the chain, but returns
  # the govselector if it has been attached to the object.
  $.fn.getgovselector = ->
    @data 'govselector'
    return

    
  return
) jQuery
