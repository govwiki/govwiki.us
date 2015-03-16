
###
# file: templates.coffee ----------------------------------------------------------------------
#
# Class to manage templates and render data on html page.
#
# The main method : render(data), get_html(data)
#-------------------------------------------------------------------------------------------------
###

# Essentially a pair name - compiled template
class Template
   
  @name     = null
  @text     = null
  @url      = null
  @template = null


  constructor :(@name,@url,@text) ->
    if @text
      @compile()
    else
      load_template()
    return @



  compile : ->
    @template = if @text then Handlebars.compile @text else null
    return @
  

  set_text: (text) ->
    @text = text
    compile()
  
  get_html:(data) ->
    html = if @template then @template(data) else ""

  load_template = (url)=>
    $.ajax
      url: url
      dataType: 'text'
      cache: true
      success: (data) =>
        console.log "template #{@name} is loaded."
        @set_text(data)
        return
    
    return @



  
  
make_simple_template =(fields)->
  
  Handlebars.registerHelper 'n', (n) -> '{{'+n+'}}'
  Handlebars.registerHelper 'fn', (n) -> fieldNames[n]
  
  txt ="""
  {{#each this}}
  {{#if this}} <p><span class='f-nam'>{{#fn this}}{{/fn}}</span><span class='f-val'>{{#n this}}{{/n}}</span></p>{{/if}}
  {{/each}}
  """
  
  tt =  Handlebars.compile txt
  return tt(fields)



make_simple_template2=(fields)->
  makeFieldHtml = (n) ->
    link = (n) ->
      ss=''
      if n != "web_site"
        ss="{{{"+n+"}}}"
      else
        ss='<a target="_blank" href="{{' + n + '}}">{{{' + n + '}}}</a>'
      return ss

    s = '{{#if '+n+'}}\n'
    s += "<p><span class='f-nam'>#{fieldNames[n]}</span><span class='f-val'>#{link(n)}</span></p>\n"
    s += '{{/if}}\n'
    return s
  
  ss = ''
  for f in fields
    ss += makeFieldHtml(f)
  return ss
  

render_tabs = (layout,data) ->
  #render header
  h = '<div role="tabpanel">'

  #render tabs
  h +='<ul class="nav nav-tabs" role="tablist">'
  
  for tab in tab_layout

    h +="""
      <li role="presentation" class="active">
        <a href="#home" aria-controls="home" role="tab" data-toggle="tab">
        #{tab}
        </a>
      </li>
    """

  h += '</ul>'

  #render tabs content
  h +="""
  """
  
  #render footer
  h +='</div>'
  return h






class Templates
  @list = undefined


  constructor:() ->
    @list = []
    txt = make_simple_template(layout0)
    txt0 = make_simple_template2(layout0)
    @add "simple",null, txt0
    console.log txt


  add:(name, url, text) ->
    @list.push new Template(name, url, text)

  get_names: ->
    (t.name for t in @list when t.template)

  get_index_by_name: (name) ->
    for t,i in @list
      if t.name is name
        return i
    return -1

  get_html: (ind, data) ->
    return if (ind is -1) then  "" else @list[ind].get_html(data)



module.exports = Templates
