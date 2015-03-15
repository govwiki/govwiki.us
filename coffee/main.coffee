###
file: main.coffe -- The entry -----------------------------------------------------------------------------------
  :
gov_finder = new GovFinder
gov_details = new GovDetails
gov_finder.on_select = gov_details.show
-----------------------------------------------------------------------------------------------------------------
###

GovSelector = require './govselector.coffee'
#renderData  = require './datarenderer.coffee'
_jqgs       = require './jquery.govselector.coffee'
#Templates      = require './templates.coffee'
Templates2      = require './templates2.coffee'
govmap      = require './govmap.coffee'

gov_selector = new GovSelector '.typeahead', 'data/h_types.json', 7
#templates = new Templates
templates = new Templates2

active_tab=""

window.remember_tab =(name)->
  active_tab = name

activate_tab =() ->
  $("#fieldTabs a[href='##{active_tab}']").tab('show')

gov_selector.on_selected = (evt, data, name) ->
  #renderData '#details', data
  $('#details').html templates.get_html(0, data)
  activate_tab()
  get_record "inc_id:#{data["inc_id"]}"
  return


get_record = (query) ->
  $.ajax
    url: "https://api.mongolab.com/api/1/databases/govwiki/collections/govs/?q={#{query}}&f={_id:0}&l=1&apiKey=0Y5X_Qk2uOJRdHJWJKSRWk6l6JqVTS2y"
    dataType: 'json'
    cache: true
    success: (data) ->
      #if data.length then renderData '#details',  data[0]
      if data.length
        $('#details').html templates.get_html(0, data[0])
        activate_tab()
        $('#maparea').css('visibility','visible')
        govmap.geocode data[0]
      return

#$('.gov').govselector()
window.geocode_addr = (input_selector)->
  govmap.gocode_addr $(input_selector).val()

$('#maparea').css('visibility','hidden')
