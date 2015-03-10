class GovSelector
  
  #bloodhound = undefined
  # callback to envoke when the user selects something
  on_selected: (evt, data, name) ->

  constructor: (@html_selector, docs_url) ->
    $.ajax
      url: docs_url
      dataType: 'json'
      cache: true
      success: @startSuggestion
      

  # Takes an array of docs to search in.
  # Constructs and returns a functions that takes 2 params 
  # q - query string and 
  # cb - callback that will be called when the search is done.
  # cb returns an array of matching documents.
  substringMatcher : (docs) ->
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


  substringMatcher1 : (docs) ->
    (q, cb) ->

      test_string =(s, regs) ->
        (if not r.test(s) then return false)  for r in regs
        return true

      regs = get_regs q
      matches = []
      # iterate through the pool of docs and for any string that
      # contains the substring `q`, add it to the `matches` array

      for d in docs
        if matches.length >= 10 then break

        #gn = strip (d.gov_name)

        if test_string(d.gov_name, regs)
          gn=d.gov_name
          matches.push d

      cb matches
      return


  strip = (s) ->
    s.replace(/<[^<>]*>/g,'')

  get_regs = (str) ->
    tr = (s) ->
      ss=s.trim(''+s)
      ss=ss.replace(/ +/g,' ')
    
    words = tr(str).split(' ')
    words.map (w)-> new RegExp(w,'i')



  suggestionTemplate : Handlebars.compile("""
    <p><span class="minwidth">{{gov_name}}</span> 
    <span class="smaller">{{state}} &nbsp;{{gov_type}}</span>
    </p>""")



  startSuggestion : (govs) =>
    # fat arrow is to ensure that this will point to the instance when calling when data loaded by Ajax
    
    # constructs the suggestion engine
    #bloodhound = new Bloodhound(
    #  datumTokenizer: Bloodhound.tokenizers.obj.whitespace('gov_name')
    #  queryTokenizer: Bloodhound.tokenizers.whitespace
    #  limit:5
    #  local: govs
    #)
    #bloodhound.initialize()
    
    $(@html_selector).attr 'placeholder', 'GOVERNMENT NAME'
    $(@html_selector).typeahead(
        hint: true
        highlight: true
        minLength: 1
      ,
        name: 'gov_name'
        displayKey: 'gov_name'
        source: @substringMatcher1(govs)
        #source: bloodhound.ttAdapter()
        templates: suggestion: @suggestionTemplate
    )
    .on 'typeahead:selected', @on_selected  #(evt, data, name)
    #.on 'typeahead:selected', (evt, data, name) => @on_selected(evt, data, name)
    
    return



