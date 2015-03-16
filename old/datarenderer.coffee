# Class to render data on html page.
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


module.exports = renderData
