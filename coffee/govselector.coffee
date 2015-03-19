
query_matcher = require('./querymatcher.coffee')

class GovSelector
  
  # stub of a callback to envoke when the user selects something
  on_selected: (evt, data, name) ->


  constructor: (@html_selector, docs_url, @num_items) ->
    $.ajax
      url: docs_url
      dataType: 'json'
      cache: true
      success: @startSuggestion
      



  suggestionTemplate : Handlebars.compile("""
    <div class="sugg-box">
      <div class="sugg-state">{{{state}}}</div>
      <div class="sugg-name">{{{gov_name}}}</div>
      <div class="sugg-type">{{{gov_type}}}</div>
    </div>""")



  entered_value = ""

  govs_array = []

  count_govs : () ->
    count =0
    for d in @govs_array
      if GOVWIKI.state_filter and d.state isnt GOVWIKI.state_filter then continue
      if GOVWIKI.gov_type_filter and d.gov_type isnt GOVWIKI.gov_type_filter then continue
      count++
    return count


  startSuggestion : (govs) =>
    @govs_array = govs
    $('.typeahead').keyup (event) =>
      @entered_value = $(event.target).val()
    
    $(@html_selector).attr 'placeholder', 'GOVERNMENT NAME'
    $(@html_selector).typeahead(
        hint: false
        highlight: false
        minLength: 1
      ,
        name: 'gov_name'
        displayKey: 'gov_name'
        source: query_matcher(govs, @num_items)
        #source: bloodhound.ttAdapter()
        templates: suggestion: @suggestionTemplate
    )
    .on 'typeahead:selected',  (evt, data, name) =>
        $('.typeahead').typeahead 'val', @entered_value
        @on_selected(evt, data, name)
   
    .on 'typeahead:cursorchanged', (evt, data, name) =>
        $('.typeahead').val @entered_value
    

    $('.gov-counter').text @count_govs()
    return





module.exports=GovSelector



