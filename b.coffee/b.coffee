


substringMatcher = (docs) ->
  (q, cb) ->
    matches = undefined
    substrRegex = undefined
    # an array that will be populated with substring matches
    matches = []
    # regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i')
    # iterate through the pool of docs and for any string that
    # contains the substring `q`, add it to the `matches` array
    $.each docs, (i, d) ->
      if substrRegex.test(d.gov_name)
        #  the typeahead jQuery plugin expects suggestions to a
        # JavaScript object, refer to typeahead docs for more info
        matches.push d
        if matches.length >= 10
          return false
      return
    cb matches
    return

suggestionTemplate = Handlebars.compile("""
<p><span class="minwidth">{{gov_name}}</span> 
<span class="smaller">{{state}} &nbsp;{{gov_type}}</span>
</p>""")
ta = undefined

startSuggestion = (govs) ->

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


  getRecord = (data) ->
    id=data["inc_id"]
    $.ajax
      url: "https://api.mongolab.com/api/1/databases/govwiki/collections/govs/?q={inc_id:#{id}}&f={_id:0}&l=1&apiKey=0Y5X_Qk2uOJRdHJWJKSRWk6l6JqVTS2y"
      dataType: 'json'
      cache: true
      success: (data) ->
        #console.log data
        if data.length then makeRecordHtml data[0]
        return


  # Attach initialized event to it
  ta.on 'typeahead:selected', (evt, data, name) ->
    makeRecordHtml data
    getRecord data
    return
  
  
  return

  

$.ajax
  url: 'js/fieldnames.js'
  dataType: 'script'
  cache: true
  success: (data) ->
    console.log "field names loaded:#{data}"
    #fieldNames = data
    return

# get reference data 
$.ajax
  url: 'data/h_types.json'
  dataType: 'json'
  cache: true
  success: startSuggestion
