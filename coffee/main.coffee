###
file: main.coffe -- The entry -----------------------------------------------------------------------------------
  :
gov_finder = new GovFinder
gov_details = new GovDetails
gov_finder.on_select = gov_details.show
-----------------------------------------------------------------------------------------------------------------
###

GovSelector = require './govselector.coffee'
_jqgs       = require './jquery.govselector.coffee'
Templates2      = require './templates2.coffee'
govmap      = require './govmap.coffee'

window.GOVWIKI =
  state_filter : ''
  gov_type_filter : ''






gov_selector = new GovSelector '.typeahead', 'data/h_types.json', 7
templates = new Templates2
active_tab=""

window.remember_tab =(name)-> active_tab = name

window.geocode_addr = (input_selector)-> govmap.gocode_addr $(input_selector).val()

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
      if data.length
        $('#details').html templates.get_html(0, data[0])
        activate_tab()
        $('#maparea').css('visibility','visible')
        govmap.geocode data[0]
      return
    error:(e) ->
      console.log e





$('#maparea').css('visibility','hidden')


templates.load_template "tabs", "config/tablayout.json"


build_selector = (container, text, url, where_to_store_value ) ->
  $.ajax
    url: url
    dataType: 'json'
    cache: true
    success: (data) =>
      #a=$.extend true [],data
      build_select_element container, text, data.sort(), where_to_store_value
      return
    error:(e) ->
      console.log e


build_select_element = (container, text, arr, where_to_store_value ) ->
  s  = "<select class='form-control'><option value=''>#{text}</option>"
  s += "<option value='#{v}'>#{v}</option>" for v in arr
  s += "</select>"
  select = $(s)
  $(container).append(select)
  select.change (e) ->
    el = $(e.target)
    window.GOVWIKI[where_to_store_value] = el.val()


build_selector('.state-container'
  , 'State..'
  , 'data/state.json'
  , 'state_filter')

build_selector('.gov-type-container'
  , 'type of government..'
  , 'data/gov_type.json'
  , 'gov_type_filter')






