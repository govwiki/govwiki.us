tab_layout0 =[
  {name:'General', fields:[
    "gov_name"
    "census_id"
    "special_district_function_code"
    "gov_type"
    "county_area_name"
    "county_area_type"
    "web_site"
  ]}
  {name:'Address', fields:[
    "census_contact"
    "address1"
    "address2"
    "city"
    "state"
    "zip"
  ]}
  {name:'Stat', fields:[
    "population"
    "population_as_of_year"
    "enrollment"
    "enrollment_as_of_year"
    "fips_state"
    "fips_county"
    "fips_place"
  ]}
  {name:'Location', fields:[
    "latitude"
    "longitude"
  ]}
  {name:'Other', fields:[
    "inc_id"
  ]}
]


###
# file: templates2.coffee ----------------------------------------------------------------------
#
# Class to manage templates and render data on html page.
#
# The main method : render(data), get_html(data)
#-------------------------------------------------------------------------------------------------
###


render_field_value =(n,data) ->
  v=data[n]
  if n == "web_site"
    return "<a target='_blank' href='#{v}'>#{v}</a>"
  else
    return v
  
  

render_field = (fName,data)->
  return ''  unless fValue = data[fName]
  """
  <div>
      <span class='f-nam'>#{fieldNames[fName]}</span>
      <span class='f-val'>#{render_field_value(fName,data)}</span>
  </div>
  """
  
render_fields =( fields, data) ->
  ( render_field(f, data) for f in fields).join('')


under = (s) -> s.replace(/ /g, '_')


render_tabs = (layout,data) ->
  #render header
  h = '<div role="tabpanel" style="font-size:150%;">'

  #render tabs
  h +='<ul class="nav nav-tabs" role="tablist">'
  
  for tab,i in layout
    active = if i>0 then '' else 'active'
    h +="""
      <li role="presentation" class="#{active}">
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






class Templates2
  @list = undefined


  constructor:() ->
    @list = []
    @list.push
      name:"tabs"
      render:(dat) ->
        render_tabs(tab_layout0, dat)


  get_names: ->
    (t.name for t in @list)

  get_index_by_name: (name) ->
    for t,i in @list
      if t.name is name
        return i
    return -1

  get_html: (ind, data) ->
    return if (ind is -1) then  "" else @list[ind].render(data)



module.exports = Templates2
