bounds_timeout=undefined


map = new GMaps
  el: '#govmap'
  lat: 37.3789008
  lng: -117.1916283
  zoom:6
  scrollwheel: false
  panControl: false
  zoomControl: true
  zoomControlOptions:
    style: google.maps.ZoomControlStyle.SMALL
  bounds_changed: ->
    on_bounds_changed_later 200


on_bounds_changed_later  = (msec)  ->
  clearTimeout bounds_timeout
  bounds_timeout = setTimeout on_bounds_changed, msec

    
on_bounds_changed =(e) ->
  console.log "bounds_changed"
  b=map.getBounds()
  url_value=b.toUrlValue()
  ne=b.getNorthEast()
  sw=b.getSouthWest()
  ne_lat=ne.lat()
  ne_lng=ne.lng()
  sw_lat=sw.lat()
  sw_lng=sw.lng()
  st = GOVWIKI.state_filter
  ty = GOVWIKI.gov_type_filter

  ###
  # Build the query.
  q=""" "latitude":{"$lt":#{ne_lat},"$gt":#{sw_lat}},"longitude":{"$lt":#{ne_lng},"$gt":#{sw_lng}}"""
  # Add filters if they exist
  q+=""","state":"#{st}" """ if st
  q+=""","gov_type":"#{ty}" """ if ty


  get_records q, 200,  (data) ->
    #console.log "length=#{data.length}"
    #console.log "lat: #{ne_lat},#{sw_lat} lng: #{ne_lng}, #{sw_lng}"
    map.removeMarkers()
    add_marker(rec) for rec in data
    return
  ###

  # Build the query 2.
  q2=""" latitude<#{ne_lat} AND latitude>#{sw_lat} AND longitude<#{ne_lng} AND longitude>#{sw_lng} """
  # Add filters if they exist
  q2+=""" AND state="#{st}" """ if st
  q2+=""" AND gov_type="#{ty}" """ if ty


  get_records2 q2, 200,  (data) ->
    #console.log "length=#{data.length}"
    #console.log "lat: #{ne_lat},#{sw_lat} lng: #{ne_lng}, #{sw_lng}"
    map.removeMarkers()
    add_marker(rec) for rec in data.record
    return



get_icon =(gov_type) ->
  
  _circle =(color)->
    path: google.maps.SymbolPath.CIRCLE
    fillOpacity: 0.5
    fillColor:color
    strokeWeight: 1
    strokeColor:'white'
    #strokePosition: google.maps.StrokePosition.OUTSIDE
    scale:6

  switch gov_type
    when 'General Purpose' then return _circle '#03C'
    when 'Cemeteries'      then return _circle '#000'
    when 'Hospitals'       then return _circle '#0C0'
    else return _circle '#D20'




add_marker =(rec)->
  #console.log "#{rec.rand} #{rec.inc_id} #{rec.zip} #{rec.latitude} #{rec.longitude} #{rec.gov_name}"
  map.addMarker
    lat: rec.latitude
    lng: rec.longitude
    icon: get_icon(rec.gov_type)
    title:  "#{rec.gov_name}, #{rec.gov_type} (#{rec.latitude}, #{rec.longitude})"
    infoWindow:
      content: create_info_window rec
    click: (e)->
      #window.GOVWIKI.show_record rec
      window.GOVWIKI.show_record2 rec
  
  return


create_info_window =(r) ->
  w = $('<div></div>')
  .append $("<a href='#'><strong>#{r.gov_name}</strong></a>").click (e)->
    e.preventDefault()
    console.log r
    #window.GOVWIKI.show_record r
    window.GOVWIKI.show_record2 r

  .append $("<div> #{r.gov_type}  #{r.city} #{r.zip} #{r.state}</div>")
  return w[0]




get_records = (query, limit, onsuccess) ->
  $.ajax
    url: "https://api.mongolab.com/api/1/databases/govwiki/collections/govs/?q={#{query}}&f={_id:0}&l=#{limit}&s={rand:1}&apiKey=0Y5X_Qk2uOJRdHJWJKSRWk6l6JqVTS2y"
    dataType: 'json'
    cache: true
    success: onsuccess
    error:(e) ->
      console.log e


get_records2 = (query, limit, onsuccess) ->
  $.ajax
    url:"http://46.101.3.79:80/rest/db/govs"
    data:
      #filter:"latitude>32 AND latitude<34 AND longitude>-87 AND longitude<-86"
      filter:query
      fields:"_id,inc_id,gov_name,gov_type,city,zip,state,latitude,longitude"
      app_name:"govwiki"
      order:"rand"
      limit:limit

    dataType: 'json'
    cache: true
    success: onsuccess
    error:(e) ->
      console.log e


# GEOCODING ========================================

pinImage = new (google.maps.MarkerImage)(
  'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=Z|7777BB|FFFFFF' ,
  new (google.maps.Size)(21, 34),
  new (google.maps.Point)(0, 0),
  new (google.maps.Point)(10, 34)
  )


geocode_addr = (addr,data) ->
  GMaps.geocode
    address: addr
    callback: (results, status) ->
      if status == 'OK'
        latlng = results[0].geometry.location
        map.setCenter latlng.lat(), latlng.lng()
        map.addMarker
          lat: latlng.lat()
          lng: latlng.lng()
          size: 'small'
          title: results[0].formatted_address
          infoWindow:
            content: results[0].formatted_address
        
        if data
          map.addMarker
            lat: data.latitude
            lng: data.longitude
            size: 'small'
            color: 'blue'
            icon: pinImage
            title:  "#{data.latitude} #{data.longitude}"
            infoWindow:
              content: "#{data.latitude} #{data.longitude}"
            
        $('.govmap-found').html "<strong>FOUND: </strong>#{results[0].formatted_address}"
      return


clear=(s)->
  return if s.match(/ box /i) then '' else s

geocode = (data) ->
  addr = "#{clear(data.address1)} #{clear(data.address2)}, #{data.city}, #{data.state} #{data.zip}, USA"
  $('#govaddress').val(addr)
  geocode_addr addr, data


module.exports =
  geocode: geocode
  gocode_addr: geocode_addr
  on_bounds_changed: on_bounds_changed
  on_bounds_changed_later: on_bounds_changed_later

