
###
# file: templates2.coffee ----------------------------------------------------------------------
#
# Class to manage templates and render data on html page.
#
# The main method : render(data), get_html(data)
#-------------------------------------------------------------------------------------------------
###



# LOAD FIELD NAMES 
fieldNames = {}

load_field_names = (url) ->
  $.ajax
    url: url
    dataType: 'json'
    cache: true
    success: (fieldnames_json) =>
      fieldNames = fieldnames_json
      return
    error:(e)->
      console.log e


load_field_names("config/fieldnames.json")



render_field_value =(n,data) ->
  v=data[n]
  if n == "web_site"
    return "<a target='_blank' href='#{v}'>#{v}</a>"
  else
    return v
  
  

render_field_name = (fName) ->
  if fieldNames[fName]?
    return fieldNames[fName]

  s = fName.replace(/_/g," ")
  s = s.charAt(0).toUpperCase() + s.substring(1)
  return s


render_field = (fName,data)->
  #return ''  unless fValue = data[fName]
  """
  <div>
      <span class='f-nam'>#{render_field_name fName}</span>
      <span class='f-val'>#{render_field_value(fName,data)}</span>
  </div>
  """

  
render_fields =( fields, data) ->
  ( render_field(f, data) for f in fields).join('')


  
under = (s) -> s.replace(/ /g, '_')


render_tabs = (initial_layout, data) ->
  layout = add_other_tab_to_layout initial_layout, data
  #render header
  h = '<div role="tabpanel" >'

  #render tabs
  h +='<ul id="fieldTabs" class="nav nav-tabs" role="tablist">'
  
  for tab,i in layout
    active = if i>0 then '' else 'active'
    h +="""
      <li role="presentation" class="#{active}" onclick="remember_tab('#{under(tab.name)}')">
        <a href="##{under(tab.name)}" aria-controls="home" role="tab" data-toggle="tab">
        #{tab.name}
        </a>
      </li>
    """

  h += '</ul>'
  h += '<div class="tab-content">'

  #render tabs content
  for tab,i in layout
    active = if i>0 then '' else 'active'
    h +="""
    <div role="tabpanel" class="tab-pane #{active}" id="#{under(tab.name)}" style="padding-top: 40px;">
        #{render_fields tab.fields, data}
    </div>
    """
  
  #render footer
  h +='</div>'
  h +='</div>'
  return h


get_layout_fields = (la) ->
  f = {}
  for t in la
    for field in t.fields
      f[field] = 1
  return f

get_record_fields = (r) ->
  f = {}
  for field_name of r
    f[field_name] = 1
  return f

get_unmentioned_fields = (la, r) ->
  layout_fields = get_layout_fields la
  record_fields = get_record_fields r
  unmentioned_fields = []
  unmentioned_fields.push(f) for f of record_fields when not layout_fields[f]
  return unmentioned_fields


add_other_tab_to_layout = (layout=[], data) ->
  #clone the layout
  l = $.extend true, [], layout
  t =
    name: "Other"
    fields: get_unmentioned_fields l, data

  l.push t
  return l


# converts tab template described in google fusion table to 
# tab template
convert_fusion_template=(templ) ->
  # returns hash of field names and their positions in array of field names
  get_col_hash = (columns) ->
    col_hash ={}
    col_hash[col_name]=i for col_name,i in templ.columns
    return col_hash
  
  # returns feild value by its name, array of fields, and hash of fields
  val = (field_name, fields, col_hush) ->
    fields[col_hash[field_name]]
  
  col_hash = get_col_hash(templ.col_hash)
  
  tab_hash={}
  for row,i in templ.rows
    category = val 'General Category', row, col_hash
    #tab_hash[category]=[] unless tab_hash[category]
    tab_hash[category]?=[]


    tab_hash[category].push val 'Field Name', row, col_hash

  return tab_hash


class Templates2

  @list = undefined

  constructor:() ->
    @list = []

  add_template: (layout_name, layout_json) ->
    @list.push
      name:layout_name
      render:(dat) ->
        render_tabs(layout_json, dat)


  load_template:(template_name, url) ->
    $.ajax
      url: url
      dataType: 'json'
      cache: true
      success: (template_json) =>
        @add_template(template_name, template_json)
        return

  load_fusion_template:(template_name, url) ->
    $.ajax
      url: url
      dataType: 'json'
      cache: true
      success: (template_json) =>
        t = convert_fusion_template template_json
        console.log t
        #@add_template(template_name, template_json)
        return


  get_names: ->
    (t.name for t in @list)

  get_index_by_name: (name) ->
    for t,i in @list
      if t.name is name
        return i
     return -1

  get_html: (ind, data) ->
    if (ind is -1) then return  ""
    
    if @list[ind]
      return @list[ind].render(data)
    else
      return ""



module.exports = Templates2
