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
    console.log "length=#{data.length}"
    console.log "lat: #{ne_lat},#{sw_lat} lng: #{ne_lng}, #{sw_lng}"
    map.removeMarkers()
    add_marker(rec) for rec in data
    return

add_marker =(rec)->
  console.log "#{rec.rand} #{rec.inc_id} #{rec.zip} #{rec.latitude} #{rec.longitude} #{rec.gov_name}"
  map.addMarker
    lat: rec.latitude
    lng: rec.longitude
    size: 'small'
    color: 'blue'
    #icon: pinImage
    title:  "#{rec.gov_name}, #{rec.gov_type} (#{rec.latitude}, #{rec.longitude})"
    infoWindow:
      content: create_info_window rec
    click: (e)->
      #e.preventDefault()
      window.GOVWIKI.show_record rec


create_info_window =(r) ->
  w = $('<div></div>')
  .append $("<a href='#'><strong>#{r.gov_name}</strong></a>").click (e)->
    e.preventDefault()
    console.log r
    window.GOVWIKI.show_record r

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

