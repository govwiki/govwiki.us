###
file: main.coffe -- The entry -----------------------------------------------------------------------------------

gov_finder = new GovFinder
gov_details = new GovDetails
gov_finder.on_select = gov_details.show
-----------------------------------------------------------------------------------------------------------------
###



gov_selector = new GovSelector '.typeahead', 'data/h_types.json'

gov_selector.on_selected = (evt, data, name) ->
      renderData '#details', data
      get_record "inc_id:#{data["inc_id"]}"
      return


get_record = (query) ->
  $.ajax
    url: "https://api.mongolab.com/api/1/databases/govwiki/collections/govs/?q={#{query}}&f={_id:0}&l=1&apiKey=0Y5X_Qk2uOJRdHJWJKSRWk6l6JqVTS2y"
    dataType: 'json'
    cache: true
    success: (data) ->
      #console.log data
      if data.length then renderData '#details',  data[0]
      return



