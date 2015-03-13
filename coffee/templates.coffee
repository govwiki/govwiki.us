
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



class Templates
  
  @list = undefined


  constructor:() ->
    @list = []
    txt0 = make_simple_template2(layout0)
    @add "simple",null, txt0
    #console.log txt0


  make_simple_template =(fields)->
    txt ="""
    {{#each fields}}
    <p><span class='f-nam'>{{this}}</span><span class='f-val'>vvv</span></p>\n
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
