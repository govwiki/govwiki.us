bounds_timeout=undefined


map = new GMaps
  el: '#govmap'
  lat: 38.1355146
  lng: -111.2349786
  zoom:5
  bounds_changed: ->
    clearTimeout bounds_timeout
    bounds_timeout = setTimeout on_bounds_changed, 300


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
  q=""" "latitude":{"$lt":#{ne_lat},"$gt":#{sw_lat}},"longitude":{"$lt":#{ne_lng},"$gt":#{sw_lng}}"""
  get_records q, 100,  (data) ->
    #console.log data
    if data.length
      console.log "length=#{data.length}"
    return


get_records = (query, limit, onsuccess) ->
  $.ajax
    url: "https://api.mongolab.com/api/1/databases/govwiki/collections/govs/?q={#{query}}&f={_id:0}&l=#{limit}&apiKey=0Y5X_Qk2uOJRdHJWJKSRWk6l6JqVTS2y"
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

