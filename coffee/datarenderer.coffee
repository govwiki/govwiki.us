###
# file: datarenderer.coffee ----------------------------------------------------------------------
#
# Class to render data on html page.
#
# The main method : render(data), get_html(data)
#-------------------------------------------------------------------------------------------------
###


class LayoutRenderer
  # returns an array of availiable layouts
  @list = -> ['simple']



renderData = (html_container, data) ->
  makeDocHtml = (data) ->
    makeFieldHtml = (n, v) ->
      link = (v) ->
        if ('' + v).indexOf('http://') == -1 then v else '<a target="_blank" href="' + v + '">' + v + '</a>'

      s = ''
      if v
        s = "<p><span class='f-nam'>#{fieldNames[n]}</span><span class='f-val'>#{link(v)}</span></p>"
       s
    
    ss = ''
    for n of data
      ss += makeFieldHtml(n, data[n])
    return ss

  $(html_container).html makeDocHtml data




$.ajax
  url: 'js/fieldnames.js'
  dataType: 'script'
  cache: true
  success: (data) ->
    console.log "field names loaded:#{}"
    #fieldNames = data
    return
