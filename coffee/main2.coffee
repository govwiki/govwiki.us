substringMatcher = (strs) ->
  (q, cb) ->
    matches = undefined
    substrRegex = undefined
    # an array that will be populated with substring matches
    matches = []
    # regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i')
    # iterate through the pool of strings and for any string that
    # contains the substring `q`, add it to the `matches` array
    #var counter=0;
    $.each strs, (i, str) ->
      if substrRegex.test(str.gov_name)
        #  the typeahead jQuery plugin expects suggestions to a
        # JavaScript object, refer to typeahead docs for more info
        matches.push str
        if matches.length >= 14
          return false
      return
    cb matches
    return

suggestionTemplate = Handlebars.compile('<p><span class="minwidth">{{gov_name}}</span> <span class="smaller">{{state}} &nbsp;{{zip}}</span></p>')
ta = undefined

startSuggestion = ->

  link = (v) ->
    if ('' + v).indexOf('http://') == -1 then v else '<a target="_blank" href="' + v + '">' + v + '</a>'

  makeFieldHtml = (n, v) ->
    s = ''
    if v
      s = "<p><span class='f-nam'>#{fieldNames[n]}</span><span class='f-val'>#{link(v)}</span></p>"
    s

  makeRecordHtml = (data) ->
    s = ''
    for n of data
      s += makeFieldHtml(n, data[n])
    $('#details').html s
    return

  $('.typeahead').attr 'placeholder', 'GOVERNMENT NAME'
  ta = $('.typeahead').typeahead({
    hint: true
    highlight: true
    minLength: 1
  },
    name: 'gov_name'
    displayKey: 'gov_name'
    source: substringMatcher(govs)
    templates: suggestion: suggestionTemplate)
  # Attach initialized event to it
  ta.on 'typeahead:selected', (evt, data, name) ->
    makeRecordHtml data
    return
  return

$.ajax
  url: 'js/fieldnames.js'
  dataType: 'script'
  cache: true
  success: ->
    console.log 'field names loaded'
    return
$.ajax
  url: 'data/govs.js'
  dataType: 'script'
  cache: true
  success: startSuggestion
