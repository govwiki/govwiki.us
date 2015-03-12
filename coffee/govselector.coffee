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
    <p><span class="sugg-main">{{{gov_name}}}</span> 
    <span class="sugg-small">{{{state}}} &nbsp;{{{gov_type}}}</span>
    </p>
    </div>""")

  entered_value:""

  startSuggestion : (govs) =>
    
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
    

    return





module.exports=GovSelector


