


# Takes an array of docs to search in.
# Returns a functions that takes 2 params 
# q - query string and 
# cb - callback that will be called when the search is done.
# cb returns an array of matching documents.
# mum_items - max number of found items to show
QueryMather = (docs, num_items=5) ->
  (q, cb) ->
    test_string =(s, regs) ->
      (if not r.test(s) then return false)  for r in regs
      return true

    [words,regs] = get_words_regs q
    matches = []
    # iterate through the pool of docs and for any string that
    # contains the substring `q`, add it to the `matches` array

    for d in docs
      if matches.length >= num_items then break
      if test_string("#{d.gov_name} #{d.state} #{d.gov_type} #{d.inc_id}", regs) then matches.push $.extend({}, d)
    
    select_text matches, words, regs
    cb matches
    return
 

# inserts <strong> elementse in array
select_text = (clones,words,regs) ->
  for d in clones
    d.gov_name=strongify(d.gov_name, words, regs)
    d.state=strongify(d.state, words, regs)
    d.gov_type=strongify(d.gov_type, words, regs)
  
  return clones



# inserts <strong> elementse
strongify = (s, words, regs) ->
  regs.forEach (r,i) ->
    s = s.replace r, "<b>#{words[i]}</b>"
  return s

# removes <> tags from a string
strip = (s) ->
  s.replace(/<[^<>]*>/g,'')


# all tirms spaces from both sides and make contracts sequences of spaces to 1
full_trim = (s) ->
  ss=s.trim(''+s)
  ss=ss.replace(/ +/g,' ')

# returns an array of words in a string
get_words = (str) ->
  full_trim(str).split(' ')


get_words_regs = (str) ->
  words = get_words str
  regs = words.map (w)-> new RegExp("#{w}",'ig')
  [words,regs]


module.exports = QueryMather

