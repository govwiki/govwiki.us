(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var add_marker, bounds_timeout, clear, geocode, geocode_addr, get_records, map, on_bounds_changed, pinImage;

bounds_timeout = void 0;

map = new GMaps({
  el: '#govmap',
  lat: 38.1355146,
  lng: -111.2349786,
  zoom: 5,
  bounds_changed: function() {
    clearTimeout(bounds_timeout);
    return bounds_timeout = setTimeout(on_bounds_changed, 300);
  }
});

on_bounds_changed = function(e) {
  var b, ne, ne_lat, ne_lng, q, sw, sw_lat, sw_lng, url_value;
  console.log("bounds_changed");
  b = map.getBounds();
  url_value = b.toUrlValue();
  ne = b.getNorthEast();
  sw = b.getSouthWest();
  ne_lat = ne.lat();
  ne_lng = ne.lng();
  sw_lat = sw.lat();
  sw_lng = sw.lng();
  q = " \"latitude\":{\"$lt\":" + ne_lat + ",\"$gt\":" + sw_lat + "},\"longitude\":{\"$lt\":" + ne_lng + ",\"$gt\":" + sw_lng + "}";
  return get_records(q, 100, function(data) {
    var i, len, rec;
    console.log("length=" + data.length);
    console.log("lat: " + ne_lat + "," + sw_lat + " lng: " + ne_lng + ", " + sw_lng);
    map.removeMarkers();
    for (i = 0, len = data.length; i < len; i++) {
      rec = data[i];
      add_marker(rec);
    }
  });
};

add_marker = function(rec) {
  console.log(rec.rand + " " + rec.inc_id + " " + rec.zip + " " + rec.latitude + " " + rec.longitude + " " + rec.gov_name);
  return map.addMarker({
    lat: rec.latitude,
    lng: rec.longitude,
    size: 'small',
    color: 'blue',
    title: rec.inc_id + " " + rec.gov_name + " " + rec.latitude + " " + rec.longitude,
    infoWindow: {
      content: rec.inc_id + " <strong>" + rec.gov_name + "</strong><br> " + rec.latitude + " " + rec.longitude
    }
  });
};

get_records = function(query, limit, onsuccess) {
  return $.ajax({
    url: "https://api.mongolab.com/api/1/databases/govwiki/collections/govs/?q={" + query + "}&f={_id:0}&l=" + limit + "&s={rand:1}&apiKey=0Y5X_Qk2uOJRdHJWJKSRWk6l6JqVTS2y",
    dataType: 'json',
    cache: true,
    success: onsuccess,
    error: function(e) {
      return console.log(e);
    }
  });
};

pinImage = new google.maps.MarkerImage('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=Z|7777BB|FFFFFF', new google.maps.Size(21, 34), new google.maps.Point(0, 0), new google.maps.Point(10, 34));

geocode_addr = function(addr, data) {
  return GMaps.geocode({
    address: addr,
    callback: function(results, status) {
      var latlng;
      if (status === 'OK') {
        latlng = results[0].geometry.location;
        map.setCenter(latlng.lat(), latlng.lng());
        map.addMarker({
          lat: latlng.lat(),
          lng: latlng.lng(),
          size: 'small',
          title: results[0].formatted_address,
          infoWindow: {
            content: results[0].formatted_address
          }
        });
        if (data) {
          map.addMarker({
            lat: data.latitude,
            lng: data.longitude,
            size: 'small',
            color: 'blue',
            icon: pinImage,
            title: data.latitude + " " + data.longitude,
            infoWindow: {
              content: data.latitude + " " + data.longitude
            }
          });
        }
        $('.govmap-found').html("<strong>FOUND: </strong>" + results[0].formatted_address);
      }
    }
  });
};

clear = function(s) {
  if (s.match(/ box /i)) {
    return '';
  } else {
    return s;
  }
};

geocode = function(data) {
  var addr;
  addr = (clear(data.address1)) + " " + (clear(data.address2)) + ", " + data.city + ", " + data.state + " " + data.zip + ", USA";
  $('#govaddress').val(addr);
  return geocode_addr(addr, data);
};

module.exports = {
  geocode: geocode,
  gocode_addr: geocode_addr
};



},{}],2:[function(require,module,exports){
var GovSelector, query_matcher,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

query_matcher = require('./querymatcher.coffee');

GovSelector = (function() {
  var entered_value, govs_array;

  GovSelector.prototype.on_selected = function(evt, data, name) {};

  function GovSelector(html_selector, docs_url, num_items) {
    this.html_selector = html_selector;
    this.num_items = num_items;
    this.startSuggestion = bind(this.startSuggestion, this);
    $.ajax({
      url: docs_url,
      dataType: 'json',
      cache: true,
      success: this.startSuggestion
    });
  }

  GovSelector.prototype.suggestionTemplate = Handlebars.compile("<div class=\"sugg-box\">\n  <div class=\"sugg-state\">{{{state}}}</div>\n  <div class=\"sugg-name\">{{{gov_name}}}</div>\n  <div class=\"sugg-type\">{{{gov_type}}}</div>\n</div>");

  entered_value = "";

  govs_array = [];

  GovSelector.prototype.count_govs = function() {
    var count, d, i, len, ref;
    count = 0;
    ref = this.govs_array;
    for (i = 0, len = ref.length; i < len; i++) {
      d = ref[i];
      if (GOVWIKI.state_filter && d.state !== GOVWIKI.state_filter) {
        continue;
      }
      if (GOVWIKI.gov_type_filter && d.gov_type !== GOVWIKI.gov_type_filter) {
        continue;
      }
      count++;
    }
    return count;
  };

  GovSelector.prototype.startSuggestion = function(govs) {
    this.govs_array = govs;
    $('.typeahead').keyup((function(_this) {
      return function(event) {
        return _this.entered_value = $(event.target).val();
      };
    })(this));
    $(this.html_selector).attr('placeholder', 'GOVERNMENT NAME');
    $(this.html_selector).typeahead({
      hint: false,
      highlight: false,
      minLength: 1
    }, {
      name: 'gov_name',
      displayKey: 'gov_name',
      source: query_matcher(govs, this.num_items),
      templates: {
        suggestion: this.suggestionTemplate
      }
    }).on('typeahead:selected', (function(_this) {
      return function(evt, data, name) {
        $('.typeahead').typeahead('val', _this.entered_value);
        return _this.on_selected(evt, data, name);
      };
    })(this)).on('typeahead:cursorchanged', (function(_this) {
      return function(evt, data, name) {
        return $('.typeahead').val(_this.entered_value);
      };
    })(this));
    $('.gov-counter').text(this.count_govs());
  };

  return GovSelector;

})();

module.exports = GovSelector;



},{"./querymatcher.coffee":4}],3:[function(require,module,exports){

/*
file: main.coffe -- The entry -----------------------------------------------------------------------------------
  :
gov_finder = new GovFinder
gov_details = new GovDetails
gov_finder.on_select = gov_details.show
-----------------------------------------------------------------------------------------------------------------
 */
var GovSelector, Templates2, activate_tab, active_tab, build_select_element, build_selector, get_record, gov_selector, govmap, livereload, start_adjusting_typeahead_width, templates;

GovSelector = require('./govselector.coffee');

Templates2 = require('./templates2.coffee');

govmap = require('./govmap.coffee');

window.GOVWIKI = {
  state_filter: '',
  gov_type_filter: ''
};

gov_selector = new GovSelector('.typeahead', 'data/h_types.json', 7);

templates = new Templates2;

active_tab = "";

window.remember_tab = function(name) {
  return active_tab = name;
};

activate_tab = function() {
  return $("#fieldTabs a[href='#" + active_tab + "']").tab('show');
};

gov_selector.on_selected = function(evt, data, name) {
  $('#details').html(templates.get_html(0, data));
  activate_tab();
  get_record("inc_id:" + data["inc_id"]);
};

get_record = function(query) {
  return $.ajax({
    url: "https://api.mongolab.com/api/1/databases/govwiki/collections/govs/?q={" + query + "}&f={_id:0}&l=1&apiKey=0Y5X_Qk2uOJRdHJWJKSRWk6l6JqVTS2y",
    dataType: 'json',
    cache: true,
    success: function(data) {
      if (data.length) {
        $('#details').html(templates.get_html(0, data[0]));
        activate_tab();
      }
    },
    error: function(e) {
      return console.log(e);
    }
  });
};


/*
window.show_rec = (rec)->
  $('#details').html templates.get_html(0, rec)
  activate_tab()
 */

build_selector = function(container, text, url, where_to_store_value) {
  return $.ajax({
    url: url,
    dataType: 'json',
    cache: true,
    success: (function(_this) {
      return function(data) {
        build_select_element(container, text, data.sort(), where_to_store_value);
      };
    })(this),
    error: function(e) {
      return console.log(e);
    }
  });
};

build_select_element = function(container, text, arr, where_to_store_value) {
  var i, len, s, select, v;
  s = "<select class='form-control' style='max-width:160px;'><option value=''>" + text + "</option>";
  for (i = 0, len = arr.length; i < len; i++) {
    v = arr[i];
    s += "<option value='" + v + "'>" + v + "</option>";
  }
  s += "</select>";
  select = $(s);
  $(container).append(select);
  return select.change(function(e) {
    var el;
    el = $(e.target);
    window.GOVWIKI[where_to_store_value] = el.val();
    return $('.gov-counter').text(gov_selector.count_govs());
  });
};

start_adjusting_typeahead_width = function() {
  return $(window).resize(function() {
    var inp, par;
    inp = $('#myinput');
    par = $('#typeahed-container');
    return inp.width(par.width());
  });
};

livereload = function(port) {
  var url;
  url = window.location.origin.replace(/:[^:]*$/, "");
  return $.getScript(url + ":" + port, (function(_this) {
    return function() {
      return $('body').append("<div style='position:absolute;z-index:1000;\nwidth:100%; top:0;color:red; text-align: center; \npadding:1px;font-size:10px;line-height:1'>live</div>");
    };
  })(this));
};

templates.load_template("tabs", "config/tablayout.json");

build_selector('.state-container', 'State..', 'data/state.json', 'state_filter');

build_selector('.gov-type-container', 'type of government..', 'data/gov_type.json', 'gov_type_filter');

start_adjusting_typeahead_width();

livereload("9090");



},{"./govmap.coffee":1,"./govselector.coffee":2,"./templates2.coffee":5}],4:[function(require,module,exports){
var QueryMather, full_trim, get_words, get_words_regs, select_text, strip, strongify;

QueryMather = function(docs, num_items) {
  if (num_items == null) {
    num_items = 5;
  }
  return function(q, cb) {
    var d, j, len, matches, ref, regs, test_string, words;
    test_string = function(s, regs) {
      var j, len, r;
      for (j = 0, len = regs.length; j < len; j++) {
        r = regs[j];
        if (!r.test(s)) {
          return false;
        }
      }
      return true;
    };
    ref = get_words_regs(q), words = ref[0], regs = ref[1];
    matches = [];
    for (j = 0, len = docs.length; j < len; j++) {
      d = docs[j];
      if (matches.length >= num_items) {
        break;
      }
      if (GOVWIKI.state_filter && d.state !== GOVWIKI.state_filter) {
        continue;
      }
      if (GOVWIKI.gov_type_filter && d.gov_type !== GOVWIKI.gov_type_filter) {
        continue;
      }
      if (test_string(d.gov_name, regs)) {
        matches.push($.extend({}, d));
      }
    }
    select_text(matches, words, regs);
    cb(matches);
  };
};

select_text = function(clones, words, regs) {
  var d, j, len;
  for (j = 0, len = clones.length; j < len; j++) {
    d = clones[j];
    d.gov_name = strongify(d.gov_name, words, regs);
  }
  return clones;
};

strongify = function(s, words, regs) {
  regs.forEach(function(r, i) {
    return s = s.replace(r, "<b>" + words[i] + "</b>");
  });
  return s;
};

strip = function(s) {
  return s.replace(/<[^<>]*>/g, '');
};

full_trim = function(s) {
  var ss;
  ss = s.trim('' + s);
  return ss = ss.replace(/ +/g, ' ');
};

get_words = function(str) {
  return full_trim(str).split(' ');
};

get_words_regs = function(str) {
  var regs, words;
  words = get_words(str);
  regs = words.map(function(w) {
    return new RegExp("" + w, 'ig');
  });
  return [words, regs];
};

module.exports = QueryMather;



},{}],5:[function(require,module,exports){

/*
 * file: templates2.coffee ----------------------------------------------------------------------
#
 * Class to manage templates and render data on html page.
#
 * The main method : render(data), get_html(data)
#-------------------------------------------------------------------------------------------------
 */
var Templates2, add_other_tab_to_layout, fieldNames, get_layout_fields, get_record_fields, get_unmentioned_fields, load_field_names, render_field, render_field_name, render_field_value, render_fields, render_tabs, under;

fieldNames = {};

load_field_names = function(url) {
  return $.ajax({
    url: url,
    dataType: 'json',
    cache: true,
    success: (function(_this) {
      return function(fieldnames_json) {
        fieldNames = fieldnames_json;
      };
    })(this),
    error: function(e) {
      return console.log(e);
    }
  });
};

load_field_names("config/fieldnames.json");

render_field_value = function(n, data) {
  var v;
  v = data[n];
  if (n === "web_site") {
    return "<a target='_blank' href='" + v + "'>" + v + "</a>";
  } else {
    return v;
  }
};

render_field_name = function(fName) {
  var s;
  if (fieldNames[fName] != null) {
    return fieldNames[fName];
  }
  s = fName.replace(/_/g, " ");
  s = s.charAt(0).toUpperCase() + s.substring(1);
  return s;
};

render_field = function(fName, data) {
  var fValue;
  if (!(fValue = data[fName])) {
    return '';
  }
  return "<div>\n    <span class='f-nam'>" + (render_field_name(fName)) + "</span>\n    <span class='f-val'>" + (render_field_value(fName, data)) + "</span>\n</div>";
};

render_fields = function(fields, data) {
  var f;
  return ((function() {
    var j, len, results;
    results = [];
    for (j = 0, len = fields.length; j < len; j++) {
      f = fields[j];
      results.push(render_field(f, data));
    }
    return results;
  })()).join('');
};

under = function(s) {
  return s.replace(/ /g, '_');
};

render_tabs = function(initial_layout, data) {
  var active, h, i, j, k, layout, len, len1, tab;
  layout = add_other_tab_to_layout(initial_layout, data);
  h = '<div role="tabpanel" >';
  h += '<ul id="fieldTabs" class="nav nav-tabs" role="tablist">';
  for (i = j = 0, len = layout.length; j < len; i = ++j) {
    tab = layout[i];
    active = i > 0 ? '' : 'active';
    h += "<li role=\"presentation\" class=\"" + active + "\" onclick=\"remember_tab('" + (under(tab.name)) + "')\">\n  <a href=\"#" + (under(tab.name)) + "\" aria-controls=\"home\" role=\"tab\" data-toggle=\"tab\">\n  " + tab.name + "\n  </a>\n</li>";
  }
  h += '</ul>';
  h += '<div class="tab-content">';
  for (i = k = 0, len1 = layout.length; k < len1; i = ++k) {
    tab = layout[i];
    active = i > 0 ? '' : 'active';
    h += "<div role=\"tabpanel\" class=\"tab-pane " + active + "\" id=\"" + (under(tab.name)) + "\" style=\"padding-top: 40px;\">\n    " + (render_fields(tab.fields, data)) + "\n</div>";
  }
  h += '</div>';
  h += '</div>';
  return h;
};

get_layout_fields = function(la) {
  var f, field, j, k, len, len1, ref, t;
  f = {};
  for (j = 0, len = la.length; j < len; j++) {
    t = la[j];
    ref = t.fields;
    for (k = 0, len1 = ref.length; k < len1; k++) {
      field = ref[k];
      f[field] = 1;
    }
  }
  return f;
};

get_record_fields = function(r) {
  var f, field_name;
  f = {};
  for (field_name in r) {
    f[field_name] = 1;
  }
  return f;
};

get_unmentioned_fields = function(la, r) {
  var f, layout_fields, record_fields, unmentioned_fields;
  layout_fields = get_layout_fields(la);
  record_fields = get_record_fields(r);
  unmentioned_fields = [];
  for (f in record_fields) {
    if (!layout_fields[f]) {
      unmentioned_fields.push(f);
    }
  }
  return unmentioned_fields;
};

add_other_tab_to_layout = function(layout, data) {
  var l, t;
  if (layout == null) {
    layout = [];
  }
  l = $.extend(true, [], layout);
  t = {
    name: "Other",
    fields: get_unmentioned_fields(l, data)
  };
  l.push(t);
  return l;
};

Templates2 = (function() {
  Templates2.list = void 0;

  function Templates2() {
    this.list = [];
  }

  Templates2.prototype.add_template = function(layout_name, layout_json) {
    return this.list.push({
      name: layout_name,
      render: function(dat) {
        return render_tabs(layout_json, dat);
      }
    });
  };

  Templates2.prototype.load_template = function(template_name, url) {
    return $.ajax({
      url: url,
      dataType: 'json',
      cache: true,
      success: (function(_this) {
        return function(template_json) {
          _this.add_template(template_name, template_json);
        };
      })(this)
    });
  };

  Templates2.prototype.get_names = function() {
    var j, len, ref, results, t;
    ref = this.list;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      t = ref[j];
      results.push(t.name);
    }
    return results;
  };

  Templates2.prototype.get_index_by_name = function(name) {
    var i, j, len, ref, t;
    ref = this.list;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      t = ref[i];
      if (t.name === name) {
        return i;
      }
    }
    return -1;
  };

  Templates2.prototype.get_html = function(ind, data) {
    if (ind === -1) {
      return "";
    }
    if (this.list[ind]) {
      return this.list[ind].render(data);
    } else {
      return "";
    }
  };

  return Templates2;

})();

module.exports = Templates2;



},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS92YWdyYW50L19wcm9qZWN0cy9nb3Z3aWtpLnVzL2NvZmZlZS9nb3ZtYXAuY29mZmVlIiwiL2hvbWUvdmFncmFudC9fcHJvamVjdHMvZ292d2lraS51cy9jb2ZmZWUvZ292c2VsZWN0b3IuY29mZmVlIiwiL2hvbWUvdmFncmFudC9fcHJvamVjdHMvZ292d2lraS51cy9jb2ZmZWUvbWFpbi5jb2ZmZWUiLCIvaG9tZS92YWdyYW50L19wcm9qZWN0cy9nb3Z3aWtpLnVzL2NvZmZlZS9xdWVyeW1hdGNoZXIuY29mZmVlIiwiL2hvbWUvdmFncmFudC9fcHJvamVjdHMvZ292d2lraS51cy9jb2ZmZWUvdGVtcGxhdGVzMi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLHVHQUFBOztBQUFBLGNBQUEsR0FBZSxNQUFmLENBQUE7O0FBQUEsR0FHQSxHQUFVLElBQUEsS0FBQSxDQUNSO0FBQUEsRUFBQSxFQUFBLEVBQUksU0FBSjtBQUFBLEVBQ0EsR0FBQSxFQUFLLFVBREw7QUFBQSxFQUVBLEdBQUEsRUFBSyxDQUFBLFdBRkw7QUFBQSxFQUdBLElBQUEsRUFBSyxDQUhMO0FBQUEsRUFJQSxjQUFBLEVBQWdCLFNBQUEsR0FBQTtBQUNkLElBQUEsWUFBQSxDQUFhLGNBQWIsQ0FBQSxDQUFBO1dBQ0EsY0FBQSxHQUFpQixVQUFBLENBQVcsaUJBQVgsRUFBOEIsR0FBOUIsRUFGSDtFQUFBLENBSmhCO0NBRFEsQ0FIVixDQUFBOztBQUFBLGlCQWFBLEdBQW1CLFNBQUMsQ0FBRCxHQUFBO0FBQ2pCLE1BQUEsdURBQUE7QUFBQSxFQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksZ0JBQVosQ0FBQSxDQUFBO0FBQUEsRUFDQSxDQUFBLEdBQUUsR0FBRyxDQUFDLFNBQUosQ0FBQSxDQURGLENBQUE7QUFBQSxFQUVBLFNBQUEs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QUFBO0FBQUM7QUFBQTtTQUFBLHFDQUFBO2lCQUFBO0FBQUEsbUJBQUEsQ0FBQyxDQUFDLEtBQUYsQ0FBQTtBQUFBO21CQURRO0VBQUEsQ0F0QlgsQ0FBQTs7QUFBQSx1QkF5QkEsaUJBQUEsR0FBbUIsU0FBQyxJQUFELEdBQUE7QUFDakIsUUFBQSxpQkFBQTtBQUFBO0FBQUEsU0FBQSw2Q0FBQTtpQkFBQTtBQUNFLE1BQUEsSUFBRyxDQUFDLENBQUMsSUFBRixLQUFVLElBQWI7QUFDRSxlQUFPLENBQVAsQ0FERjtPQURGO0FBQUEsS0FBQTtBQUdDLFdBQU8sQ0FBQSxDQUFQLENBSmdCO0VBQUEsQ0F6Qm5CLENBQUE7O0FBQUEsdUJBK0JBLFFBQUEsR0FBVSxTQUFDLEdBQUQsRUFBTSxJQUFOLEdBQUE7QUFDUixJQUFBLElBQUksR0FBQSxLQUFPLENBQUEsQ0FBWDtBQUFvQixhQUFRLEVBQVIsQ0FBcEI7S0FBQTtBQUVBLElBQUEsSUFBRyxJQUFDLENBQUEsSUFBSyxDQUFBLEdBQUEsQ0FBVDtBQUNFLGFBQU8sSUFBQyxDQUFBLElBQUssQ0FBQSxHQUFBLENBQUksQ0FBQyxNQUFYLENBQWtCLElBQWxCLENBQVAsQ0FERjtLQUFBLE1BQUE7QUFHRSxhQUFPLEVBQVAsQ0FIRjtLQUhRO0VBQUEsQ0EvQlYsQ0FBQTs7b0JBQUE7O0lBcEpGLENBQUE7O0FBQUEsTUE2TE0sQ0FBQyxPQUFQLEdBQWlCLFVBN0xqQixDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImJvdW5kc190aW1lb3V0PXVuZGVmaW5lZFxuXG5cbm1hcCA9IG5ldyBHTWFwc1xuICBlbDogJyNnb3ZtYXAnXG4gIGxhdDogMzguMTM1NTE0NlxuICBsbmc6IC0xMTEuMjM0OTc4NlxuICB6b29tOjVcbiAgYm91bmRzX2NoYW5nZWQ6IC0+XG4gICAgY2xlYXJUaW1lb3V0IGJvdW5kc190aW1lb3V0XG4gICAgYm91bmRzX3RpbWVvdXQgPSBzZXRUaW1lb3V0IG9uX2JvdW5kc19jaGFuZ2VkLCAzMDBcblxuXG5vbl9ib3VuZHNfY2hhbmdlZCA9KGUpIC0+XG4gIGNvbnNvbGUubG9nIFwiYm91bmRzX2NoYW5nZWRcIlxuICBiPW1hcC5nZXRCb3VuZHMoKVxuICB1cmxfdmFsdWU9Yi50b1VybFZhbHVlKClcbiAgbmU9Yi5nZXROb3J0aEVhc3QoKVxuICBzdz1iLmdldFNvdXRoV2VzdCgpXG4gIG5lX2xhdD1uZS5sYXQoKVxuICBuZV9sbmc9bmUubG5nKClcbiAgc3dfbGF0PXN3LmxhdCgpXG4gIHN3X2xuZz1zdy5sbmcoKVxuICBxPVwiXCJcIiBcImxhdGl0dWRlXCI6e1wiJGx0XCI6I3tuZV9sYXR9LFwiJGd0XCI6I3tzd19sYXR9fSxcImxvbmdpdHVkZVwiOntcIiRsdFwiOiN7bmVfbG5nfSxcIiRndFwiOiN7c3dfbG5nfX1cIlwiXCJcbiAgZ2V0X3JlY29yZHMgcSwgMTAwLCAgKGRhdGEpIC0+XG4gICAgY29uc29sZS5sb2cgXCJsZW5ndGg9I3tkYXRhLmxlbmd0aH1cIlxuICAgIGNvbnNvbGUubG9nIFwibGF0OiAje25lX2xhdH0sI3tzd19sYXR9IGxuZzogI3tuZV9sbmd9LCAje3N3X2xuZ31cIlxuICAgIG1hcC5yZW1vdmVNYXJrZXJzKClcbiAgICBhZGRfbWFya2VyKHJlYykgZm9yIHJlYyBpbiBkYXRhXG4gICAgcmV0dXJuXG5cbmFkZF9tYXJrZXIgPShyZWMpLT5cbiAgY29uc29sZS5sb2cgXCIje3JlYy5yYW5kfSAje3JlYy5pbmNfaWR9ICN7cmVjLnppcH0gI3tyZWMubGF0aXR1ZGV9ICN7cmVjLmxvbmdpdHVkZX0gI3tyZWMuZ292X25hbWV9XCJcbiAgbWFwLmFkZE1hcmtlclxuICAgIGxhdDogcmVjLmxhdGl0dWRlXG4gICAgbG5nOiByZWMubG9uZ2l0dWRlXG4gICAgc2l6ZTogJ3NtYWxsJ1xuICAgIGNvbG9yOiAnYmx1ZSdcbiAgICAjaWNvbjogcGluSW1hZ2VcbiAgICB0aXRsZTogIFwiI3tyZWMuaW5jX2lkfSAje3JlYy5nb3ZfbmFtZX0gI3tyZWMubGF0aXR1ZGV9ICN7cmVjLmxvbmdpdHVkZX1cIlxuICAgIGluZm9XaW5kb3c6XG4gICAgICBjb250ZW50OiBcIiN7cmVjLmluY19pZH0gPHN0cm9uZz4je3JlYy5nb3ZfbmFtZX08L3N0cm9uZz48YnI+ICN7cmVjLmxhdGl0dWRlfSAje3JlYy5sb25naXR1ZGV9XCJcbiAgICAjY2xpY2s6IChlKS0+XG4gICAgIyAgYWxlcnQgZGF0YS5nb3ZfbmFtZVxuXG5cblxuXG5nZXRfcmVjb3JkcyA9IChxdWVyeSwgbGltaXQsIG9uc3VjY2VzcykgLT5cbiAgJC5hamF4XG4gICAgdXJsOiBcImh0dHBzOi8vYXBpLm1vbmdvbGFiLmNvbS9hcGkvMS9kYXRhYmFzZXMvZ292d2lraS9jb2xsZWN0aW9ucy9nb3ZzLz9xPXsje3F1ZXJ5fX0mZj17X2lkOjB9Jmw9I3tsaW1pdH0mcz17cmFuZDoxfSZhcGlLZXk9MFk1WF9RazJ1T0pSZEhKV0pLU1JXazZsNkpxVlRTMnlcIlxuICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICBjYWNoZTogdHJ1ZVxuICAgIHN1Y2Nlc3M6IG9uc3VjY2Vzc1xuICAgIGVycm9yOihlKSAtPlxuICAgICAgY29uc29sZS5sb2cgZVxuXG4jIEdFT0NPRElORyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbnBpbkltYWdlID0gbmV3IChnb29nbGUubWFwcy5NYXJrZXJJbWFnZSkoXG4gICdodHRwOi8vY2hhcnQuYXBpcy5nb29nbGUuY29tL2NoYXJ0P2Noc3Q9ZF9tYXBfcGluX2xldHRlciZjaGxkPVp8Nzc3N0JCfEZGRkZGRicgLFxuICBuZXcgKGdvb2dsZS5tYXBzLlNpemUpKDIxLCAzNCksXG4gIG5ldyAoZ29vZ2xlLm1hcHMuUG9pbnQpKDAsIDApLFxuICBuZXcgKGdvb2dsZS5tYXBzLlBvaW50KSgxMCwgMzQpXG4gIClcblxuXG5nZW9jb2RlX2FkZHIgPSAoYWRkcixkYXRhKSAtPlxuICBHTWFwcy5nZW9jb2RlXG4gICAgYWRkcmVzczogYWRkclxuICAgIGNhbGxiYWNrOiAocmVzdWx0cywgc3RhdHVzKSAtPlxuICAgICAgaWYgc3RhdHVzID09ICdPSydcbiAgICAgICAgbGF0bG5nID0gcmVzdWx0c1swXS5nZW9tZXRyeS5sb2NhdGlvblxuICAgICAgICBtYXAuc2V0Q2VudGVyIGxhdGxuZy5sYXQoKSwgbGF0bG5nLmxuZygpXG4gICAgICAgIG1hcC5hZGRNYXJrZXJcbiAgICAgICAgICBsYXQ6IGxhdGxuZy5sYXQoKVxuICAgICAgICAgIGxuZzogbGF0bG5nLmxuZygpXG4gICAgICAgICAgc2l6ZTogJ3NtYWxsJ1xuICAgICAgICAgIHRpdGxlOiByZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzXG4gICAgICAgICAgaW5mb1dpbmRvdzpcbiAgICAgICAgICAgIGNvbnRlbnQ6IHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3NcbiAgICAgICAgXG4gICAgICAgIGlmIGRhdGFcbiAgICAgICAgICBtYXAuYWRkTWFya2VyXG4gICAgICAgICAgICBsYXQ6IGRhdGEubGF0aXR1ZGVcbiAgICAgICAgICAgIGxuZzogZGF0YS5sb25naXR1ZGVcbiAgICAgICAgICAgIHNpemU6ICdzbWFsbCdcbiAgICAgICAgICAgIGNvbG9yOiAnYmx1ZSdcbiAgICAgICAgICAgIGljb246IHBpbkltYWdlXG4gICAgICAgICAgICB0aXRsZTogIFwiI3tkYXRhLmxhdGl0dWRlfSAje2RhdGEubG9uZ2l0dWRlfVwiXG4gICAgICAgICAgICBpbmZvV2luZG93OlxuICAgICAgICAgICAgICBjb250ZW50OiBcIiN7ZGF0YS5sYXRpdHVkZX0gI3tkYXRhLmxvbmdpdHVkZX1cIlxuICAgICAgICAgICAgXG4gICAgICAgICQoJy5nb3ZtYXAtZm91bmQnKS5odG1sIFwiPHN0cm9uZz5GT1VORDogPC9zdHJvbmc+I3tyZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzfVwiXG4gICAgICByZXR1cm5cblxuXG5jbGVhcj0ocyktPlxuICByZXR1cm4gaWYgcy5tYXRjaCgvIGJveCAvaSkgdGhlbiAnJyBlbHNlIHNcblxuZ2VvY29kZSA9IChkYXRhKSAtPlxuICBhZGRyID0gXCIje2NsZWFyKGRhdGEuYWRkcmVzczEpfSAje2NsZWFyKGRhdGEuYWRkcmVzczIpfSwgI3tkYXRhLmNpdHl9LCAje2RhdGEuc3RhdGV9ICN7ZGF0YS56aXB9LCBVU0FcIlxuICAkKCcjZ292YWRkcmVzcycpLnZhbChhZGRyKVxuICBnZW9jb2RlX2FkZHIgYWRkciwgZGF0YVxuXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgZ2VvY29kZTogZ2VvY29kZVxuICBnb2NvZGVfYWRkcjogZ2VvY29kZV9hZGRyXG5cbiIsIlxucXVlcnlfbWF0Y2hlciA9IHJlcXVpcmUoJy4vcXVlcnltYXRjaGVyLmNvZmZlZScpXG5cbmNsYXNzIEdvdlNlbGVjdG9yXG4gIFxuICAjIHN0dWIgb2YgYSBjYWxsYmFjayB0byBlbnZva2Ugd2hlbiB0aGUgdXNlciBzZWxlY3RzIHNvbWV0aGluZ1xuICBvbl9zZWxlY3RlZDogKGV2dCwgZGF0YSwgbmFtZSkgLT5cblxuXG4gIGNvbnN0cnVjdG9yOiAoQGh0bWxfc2VsZWN0b3IsIGRvY3NfdXJsLCBAbnVtX2l0ZW1zKSAtPlxuICAgICQuYWpheFxuICAgICAgdXJsOiBkb2NzX3VybFxuICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgY2FjaGU6IHRydWVcbiAgICAgIHN1Y2Nlc3M6IEBzdGFydFN1Z2dlc3Rpb25cbiAgICAgIFxuXG5cblxuICBzdWdnZXN0aW9uVGVtcGxhdGUgOiBIYW5kbGViYXJzLmNvbXBpbGUoXCJcIlwiXG4gICAgPGRpdiBjbGFzcz1cInN1Z2ctYm94XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwic3VnZy1zdGF0ZVwiPnt7e3N0YXRlfX19PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwic3VnZy1uYW1lXCI+e3t7Z292X25hbWV9fX08L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzdWdnLXR5cGVcIj57e3tnb3ZfdHlwZX19fTwvZGl2PlxuICAgIDwvZGl2PlwiXCJcIilcblxuXG5cbiAgZW50ZXJlZF92YWx1ZSA9IFwiXCJcblxuICBnb3ZzX2FycmF5ID0gW11cblxuICBjb3VudF9nb3ZzIDogKCkgLT5cbiAgICBjb3VudCA9MFxuICAgIGZvciBkIGluIEBnb3ZzX2FycmF5XG4gICAgICBpZiBHT1ZXSUtJLnN0YXRlX2ZpbHRlciBhbmQgZC5zdGF0ZSBpc250IEdPVldJS0kuc3RhdGVfZmlsdGVyIHRoZW4gY29udGludWVcbiAgICAgIGlmIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIGFuZCBkLmdvdl90eXBlIGlzbnQgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXIgdGhlbiBjb250aW51ZVxuICAgICAgY291bnQrK1xuICAgIHJldHVybiBjb3VudFxuXG5cbiAgc3RhcnRTdWdnZXN0aW9uIDogKGdvdnMpID0+XG4gICAgQGdvdnNfYXJyYXkgPSBnb3ZzXG4gICAgJCgnLnR5cGVhaGVhZCcpLmtleXVwIChldmVudCkgPT5cbiAgICAgIEBlbnRlcmVkX3ZhbHVlID0gJChldmVudC50YXJnZXQpLnZhbCgpXG4gICAgXG4gICAgJChAaHRtbF9zZWxlY3RvcikuYXR0ciAncGxhY2Vob2xkZXInLCAnR09WRVJOTUVOVCBOQU1FJ1xuICAgICQoQGh0bWxfc2VsZWN0b3IpLnR5cGVhaGVhZChcbiAgICAgICAgaGludDogZmFsc2VcbiAgICAgICAgaGlnaGxpZ2h0OiBmYWxzZVxuICAgICAgICBtaW5MZW5ndGg6IDFcbiAgICAgICxcbiAgICAgICAgbmFtZTogJ2dvdl9uYW1lJ1xuICAgICAgICBkaXNwbGF5S2V5OiAnZ292X25hbWUnXG4gICAgICAgIHNvdXJjZTogcXVlcnlfbWF0Y2hlcihnb3ZzLCBAbnVtX2l0ZW1zKVxuICAgICAgICAjc291cmNlOiBibG9vZGhvdW5kLnR0QWRhcHRlcigpXG4gICAgICAgIHRlbXBsYXRlczogc3VnZ2VzdGlvbjogQHN1Z2dlc3Rpb25UZW1wbGF0ZVxuICAgIClcbiAgICAub24gJ3R5cGVhaGVhZDpzZWxlY3RlZCcsICAoZXZ0LCBkYXRhLCBuYW1lKSA9PlxuICAgICAgICAkKCcudHlwZWFoZWFkJykudHlwZWFoZWFkICd2YWwnLCBAZW50ZXJlZF92YWx1ZVxuICAgICAgICBAb25fc2VsZWN0ZWQoZXZ0LCBkYXRhLCBuYW1lKVxuICAgXG4gICAgLm9uICd0eXBlYWhlYWQ6Y3Vyc29yY2hhbmdlZCcsIChldnQsIGRhdGEsIG5hbWUpID0+XG4gICAgICAgICQoJy50eXBlYWhlYWQnKS52YWwgQGVudGVyZWRfdmFsdWVcbiAgICBcblxuICAgICQoJy5nb3YtY291bnRlcicpLnRleHQgQGNvdW50X2dvdnMoKVxuICAgIHJldHVyblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzPUdvdlNlbGVjdG9yXG5cblxuXG4iLCIjIyNcbmZpbGU6IG1haW4uY29mZmUgLS0gVGhlIGVudHJ5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIDpcbmdvdl9maW5kZXIgPSBuZXcgR292RmluZGVyXG5nb3ZfZGV0YWlscyA9IG5ldyBHb3ZEZXRhaWxzXG5nb3ZfZmluZGVyLm9uX3NlbGVjdCA9IGdvdl9kZXRhaWxzLnNob3dcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyNcblxuR292U2VsZWN0b3IgPSByZXF1aXJlICcuL2dvdnNlbGVjdG9yLmNvZmZlZSdcbiNfanFncyAgICAgICA9IHJlcXVpcmUgJy4vanF1ZXJ5LmdvdnNlbGVjdG9yLmNvZmZlZSdcblRlbXBsYXRlczIgICAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzMi5jb2ZmZWUnXG5nb3ZtYXAgICAgICA9IHJlcXVpcmUgJy4vZ292bWFwLmNvZmZlZSdcblxud2luZG93LkdPVldJS0kgPVxuICBzdGF0ZV9maWx0ZXIgOiAnJ1xuICBnb3ZfdHlwZV9maWx0ZXIgOiAnJ1xuXG5cblxuXG5cblxuZ292X3NlbGVjdG9yID0gbmV3IEdvdlNlbGVjdG9yICcudHlwZWFoZWFkJywgJ2RhdGEvaF90eXBlcy5qc29uJywgN1xudGVtcGxhdGVzID0gbmV3IFRlbXBsYXRlczJcbmFjdGl2ZV90YWI9XCJcIlxuXG53aW5kb3cucmVtZW1iZXJfdGFiID0obmFtZSktPiBhY3RpdmVfdGFiID0gbmFtZVxuXG4jd2luZG93Lmdlb2NvZGVfYWRkciA9IChpbnB1dF9zZWxlY3RvciktPiBnb3ZtYXAuZ29jb2RlX2FkZHIgJChpbnB1dF9zZWxlY3RvcikudmFsKClcblxuYWN0aXZhdGVfdGFiID0oKSAtPlxuICAkKFwiI2ZpZWxkVGFicyBhW2hyZWY9JyMje2FjdGl2ZV90YWJ9J11cIikudGFiKCdzaG93JylcblxuXG5nb3Zfc2VsZWN0b3Iub25fc2VsZWN0ZWQgPSAoZXZ0LCBkYXRhLCBuYW1lKSAtPlxuICAjcmVuZGVyRGF0YSAnI2RldGFpbHMnLCBkYXRhXG4gICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZGF0YSlcbiAgYWN0aXZhdGVfdGFiKClcbiAgZ2V0X3JlY29yZCBcImluY19pZDoje2RhdGFbXCJpbmNfaWRcIl19XCJcbiAgcmV0dXJuXG5cblxuZ2V0X3JlY29yZCA9IChxdWVyeSkgLT5cbiAgJC5hamF4XG4gICAgdXJsOiBcImh0dHBzOi8vYXBpLm1vbmdvbGFiLmNvbS9hcGkvMS9kYXRhYmFzZXMvZ292d2lraS9jb2xsZWN0aW9ucy9nb3ZzLz9xPXsje3F1ZXJ5fX0mZj17X2lkOjB9Jmw9MSZhcGlLZXk9MFk1WF9RazJ1T0pSZEhKV0pLU1JXazZsNkpxVlRTMnlcIlxuICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICBjYWNoZTogdHJ1ZVxuICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgaWYgZGF0YS5sZW5ndGhcbiAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBkYXRhWzBdKVxuICAgICAgICBhY3RpdmF0ZV90YWIoKVxuICAgICAgICAjZ292bWFwLmdlb2NvZGUgZGF0YVswXVxuICAgICAgcmV0dXJuXG4gICAgZXJyb3I6KGUpIC0+XG4gICAgICBjb25zb2xlLmxvZyBlXG5cblxuIyMjXG53aW5kb3cuc2hvd19yZWMgPSAocmVjKS0+XG4gICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgcmVjKVxuICBhY3RpdmF0ZV90YWIoKVxuIyMjXG5cbmJ1aWxkX3NlbGVjdG9yID0gKGNvbnRhaW5lciwgdGV4dCwgdXJsLCB3aGVyZV90b19zdG9yZV92YWx1ZSApIC0+XG4gICQuYWpheFxuICAgIHVybDogdXJsXG4gICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgIGNhY2hlOiB0cnVlXG4gICAgc3VjY2VzczogKGRhdGEpID0+XG4gICAgICAjYT0kLmV4dGVuZCB0cnVlIFtdLGRhdGFcbiAgICAgIGJ1aWxkX3NlbGVjdF9lbGVtZW50IGNvbnRhaW5lciwgdGV4dCwgZGF0YS5zb3J0KCksIHdoZXJlX3RvX3N0b3JlX3ZhbHVlXG4gICAgICByZXR1cm5cbiAgICBlcnJvcjooZSkgLT5cbiAgICAgIGNvbnNvbGUubG9nIGVcblxuXG5idWlsZF9zZWxlY3RfZWxlbWVudCA9IChjb250YWluZXIsIHRleHQsIGFyciwgd2hlcmVfdG9fc3RvcmVfdmFsdWUgKSAtPlxuICBzICA9IFwiPHNlbGVjdCBjbGFzcz0nZm9ybS1jb250cm9sJyBzdHlsZT0nbWF4LXdpZHRoOjE2MHB4Oyc+PG9wdGlvbiB2YWx1ZT0nJz4je3RleHR9PC9vcHRpb24+XCJcbiAgcyArPSBcIjxvcHRpb24gdmFsdWU9JyN7dn0nPiN7dn08L29wdGlvbj5cIiBmb3IgdiBpbiBhcnJcbiAgcyArPSBcIjwvc2VsZWN0PlwiXG4gIHNlbGVjdCA9ICQocylcbiAgJChjb250YWluZXIpLmFwcGVuZChzZWxlY3QpXG4gIHNlbGVjdC5jaGFuZ2UgKGUpIC0+XG4gICAgZWwgPSAkKGUudGFyZ2V0KVxuICAgIHdpbmRvdy5HT1ZXSUtJW3doZXJlX3RvX3N0b3JlX3ZhbHVlXSA9IGVsLnZhbCgpXG4gICAgJCgnLmdvdi1jb3VudGVyJykudGV4dCBnb3Zfc2VsZWN0b3IuY291bnRfZ292cygpXG5cblxuc3RhcnRfYWRqdXN0aW5nX3R5cGVhaGVhZF93aWR0aCA9KCkgLT5cbiAgJCh3aW5kb3cpLnJlc2l6ZSAtPlxuICAgIGlucCA9ICQoJyNteWlucHV0JylcbiAgICBwYXIgPSAkKCcjdHlwZWFoZWQtY29udGFpbmVyJylcbiAgICAjY29uc29sZS5sb2cgXCIje2lucC53aWR0aCgpfSA6ICN7cGFyLndpZHRoKCl9XCJcbiAgICBpbnAud2lkdGggcGFyLndpZHRoKClcblxuXG4jIGFkZCBsaXZlIHJlbG9hZCB0byB0aGUgc2l0ZS4gRm9yIGRldmVsb3BtZW50IG9ubHkuXG5saXZlcmVsb2FkID0gKHBvcnQpIC0+XG4gIHVybD13aW5kb3cubG9jYXRpb24ub3JpZ2luLnJlcGxhY2UgLzpbXjpdKiQvLCBcIlwiXG4gICQuZ2V0U2NyaXB0IHVybCArIFwiOlwiICsgcG9ydCwgPT5cbiAgICAkKCdib2R5JykuYXBwZW5kIFwiXCJcIlxuICAgIDxkaXYgc3R5bGU9J3Bvc2l0aW9uOmFic29sdXRlO3otaW5kZXg6MTAwMDtcbiAgICB3aWR0aDoxMDAlOyB0b3A6MDtjb2xvcjpyZWQ7IHRleHQtYWxpZ246IGNlbnRlcjsgXG4gICAgcGFkZGluZzoxcHg7Zm9udC1zaXplOjEwcHg7bGluZS1oZWlnaHQ6MSc+bGl2ZTwvZGl2PlxuICAgIFwiXCJcIlxuXG5cbiAgICBcbnRlbXBsYXRlcy5sb2FkX3RlbXBsYXRlIFwidGFic1wiLCBcImNvbmZpZy90YWJsYXlvdXQuanNvblwiXG5cbmJ1aWxkX3NlbGVjdG9yKCcuc3RhdGUtY29udGFpbmVyJyAsICdTdGF0ZS4uJyAsICdkYXRhL3N0YXRlLmpzb24nICwgJ3N0YXRlX2ZpbHRlcicpXG5idWlsZF9zZWxlY3RvcignLmdvdi10eXBlLWNvbnRhaW5lcicgLCAndHlwZSBvZiBnb3Zlcm5tZW50Li4nICwgJ2RhdGEvZ292X3R5cGUuanNvbicgLCAnZ292X3R5cGVfZmlsdGVyJylcblxuXG5zdGFydF9hZGp1c3RpbmdfdHlwZWFoZWFkX3dpZHRoKClcblxubGl2ZXJlbG9hZCBcIjkwOTBcIlxuXG4iLCJcblxuXG4jIFRha2VzIGFuIGFycmF5IG9mIGRvY3MgdG8gc2VhcmNoIGluLlxuIyBSZXR1cm5zIGEgZnVuY3Rpb25zIHRoYXQgdGFrZXMgMiBwYXJhbXMgXG4jIHEgLSBxdWVyeSBzdHJpbmcgYW5kIFxuIyBjYiAtIGNhbGxiYWNrIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGUgc2VhcmNoIGlzIGRvbmUuXG4jIGNiIHJldHVybnMgYW4gYXJyYXkgb2YgbWF0Y2hpbmcgZG9jdW1lbnRzLlxuIyBtdW1faXRlbXMgLSBtYXggbnVtYmVyIG9mIGZvdW5kIGl0ZW1zIHRvIHNob3dcblF1ZXJ5TWF0aGVyID0gKGRvY3MsIG51bV9pdGVtcz01KSAtPlxuICAocSwgY2IpIC0+XG4gICAgdGVzdF9zdHJpbmcgPShzLCByZWdzKSAtPlxuICAgICAgKGlmIG5vdCByLnRlc3QocykgdGhlbiByZXR1cm4gZmFsc2UpICBmb3IgciBpbiByZWdzXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgW3dvcmRzLHJlZ3NdID0gZ2V0X3dvcmRzX3JlZ3MgcVxuICAgIG1hdGNoZXMgPSBbXVxuICAgICMgaXRlcmF0ZSB0aHJvdWdoIHRoZSBwb29sIG9mIGRvY3MgYW5kIGZvciBhbnkgc3RyaW5nIHRoYXRcbiAgICAjIGNvbnRhaW5zIHRoZSBzdWJzdHJpbmcgYHFgLCBhZGQgaXQgdG8gdGhlIGBtYXRjaGVzYCBhcnJheVxuXG4gICAgZm9yIGQgaW4gZG9jc1xuICAgICAgaWYgbWF0Y2hlcy5sZW5ndGggPj0gbnVtX2l0ZW1zIHRoZW4gYnJlYWtcbiAgICAgIGlmIEdPVldJS0kuc3RhdGVfZmlsdGVyIGFuZCBkLnN0YXRlIGlzbnQgR09WV0lLSS5zdGF0ZV9maWx0ZXIgdGhlbiBjb250aW51ZVxuICAgICAgaWYgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXIgYW5kIGQuZ292X3R5cGUgaXNudCBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlciB0aGVuIGNvbnRpbnVlXG5cbiAgICAgIGlmIHRlc3Rfc3RyaW5nKGQuZ292X25hbWUsIHJlZ3MpIHRoZW4gbWF0Y2hlcy5wdXNoICQuZXh0ZW5kKHt9LCBkKVxuICAgICAgI2lmIHRlc3Rfc3RyaW5nKFwiI3tkLmdvdl9uYW1lfSAje2Quc3RhdGV9ICN7ZC5nb3ZfdHlwZX0gI3tkLmluY19pZH1cIiwgcmVncykgdGhlbiBtYXRjaGVzLnB1c2ggJC5leHRlbmQoe30sIGQpXG4gICAgXG4gICAgc2VsZWN0X3RleHQgbWF0Y2hlcywgd29yZHMsIHJlZ3NcbiAgICBjYiBtYXRjaGVzXG4gICAgcmV0dXJuXG4gXG5cbiMgaW5zZXJ0cyA8c3Ryb25nPiBlbGVtZW50c2UgaW4gYXJyYXlcbnNlbGVjdF90ZXh0ID0gKGNsb25lcyx3b3JkcyxyZWdzKSAtPlxuICBmb3IgZCBpbiBjbG9uZXNcbiAgICBkLmdvdl9uYW1lPXN0cm9uZ2lmeShkLmdvdl9uYW1lLCB3b3JkcywgcmVncylcbiAgICAjZC5zdGF0ZT1zdHJvbmdpZnkoZC5zdGF0ZSwgd29yZHMsIHJlZ3MpXG4gICAgI2QuZ292X3R5cGU9c3Ryb25naWZ5KGQuZ292X3R5cGUsIHdvcmRzLCByZWdzKVxuICBcbiAgcmV0dXJuIGNsb25lc1xuXG5cblxuIyBpbnNlcnRzIDxzdHJvbmc+IGVsZW1lbnRzZVxuc3Ryb25naWZ5ID0gKHMsIHdvcmRzLCByZWdzKSAtPlxuICByZWdzLmZvckVhY2ggKHIsaSkgLT5cbiAgICBzID0gcy5yZXBsYWNlIHIsIFwiPGI+I3t3b3Jkc1tpXX08L2I+XCJcbiAgcmV0dXJuIHNcblxuIyByZW1vdmVzIDw+IHRhZ3MgZnJvbSBhIHN0cmluZ1xuc3RyaXAgPSAocykgLT5cbiAgcy5yZXBsYWNlKC88W148Pl0qPi9nLCcnKVxuXG5cbiMgYWxsIHRpcm1zIHNwYWNlcyBmcm9tIGJvdGggc2lkZXMgYW5kIG1ha2UgY29udHJhY3RzIHNlcXVlbmNlcyBvZiBzcGFjZXMgdG8gMVxuZnVsbF90cmltID0gKHMpIC0+XG4gIHNzPXMudHJpbSgnJytzKVxuICBzcz1zcy5yZXBsYWNlKC8gKy9nLCcgJylcblxuIyByZXR1cm5zIGFuIGFycmF5IG9mIHdvcmRzIGluIGEgc3RyaW5nXG5nZXRfd29yZHMgPSAoc3RyKSAtPlxuICBmdWxsX3RyaW0oc3RyKS5zcGxpdCgnICcpXG5cblxuZ2V0X3dvcmRzX3JlZ3MgPSAoc3RyKSAtPlxuICB3b3JkcyA9IGdldF93b3JkcyBzdHJcbiAgcmVncyA9IHdvcmRzLm1hcCAodyktPiBuZXcgUmVnRXhwKFwiI3t3fVwiLCdpZycpXG4gIFt3b3JkcyxyZWdzXVxuXG5cbm1vZHVsZS5leHBvcnRzID0gUXVlcnlNYXRoZXJcblxuIiwiXG4jIyNcbiMgZmlsZTogdGVtcGxhdGVzMi5jb2ZmZWUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuI1xuIyBDbGFzcyB0byBtYW5hZ2UgdGVtcGxhdGVzIGFuZCByZW5kZXIgZGF0YSBvbiBodG1sIHBhZ2UuXG4jXG4jIFRoZSBtYWluIG1ldGhvZCA6IHJlbmRlcihkYXRhKSwgZ2V0X2h0bWwoZGF0YSlcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyNcblxuXG5cbiMgTE9BRCBGSUVMRCBOQU1FUyBcbmZpZWxkTmFtZXMgPSB7fVxuXG5sb2FkX2ZpZWxkX25hbWVzID0gKHVybCkgLT5cbiAgJC5hamF4XG4gICAgdXJsOiB1cmxcbiAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgY2FjaGU6IHRydWVcbiAgICBzdWNjZXNzOiAoZmllbGRuYW1lc19qc29uKSA9PlxuICAgICAgZmllbGROYW1lcyA9IGZpZWxkbmFtZXNfanNvblxuICAgICAgcmV0dXJuXG4gICAgZXJyb3I6KGUpLT5cbiAgICAgIGNvbnNvbGUubG9nIGVcblxuXG5sb2FkX2ZpZWxkX25hbWVzKFwiY29uZmlnL2ZpZWxkbmFtZXMuanNvblwiKVxuXG5cblxucmVuZGVyX2ZpZWxkX3ZhbHVlID0obixkYXRhKSAtPlxuICB2PWRhdGFbbl1cbiAgaWYgbiA9PSBcIndlYl9zaXRlXCJcbiAgICByZXR1cm4gXCI8YSB0YXJnZXQ9J19ibGFuaycgaHJlZj0nI3t2fSc+I3t2fTwvYT5cIlxuICBlbHNlXG4gICAgcmV0dXJuIHZcbiAgXG4gIFxuXG5yZW5kZXJfZmllbGRfbmFtZSA9IChmTmFtZSkgLT5cbiAgaWYgZmllbGROYW1lc1tmTmFtZV0/XG4gICAgcmV0dXJuIGZpZWxkTmFtZXNbZk5hbWVdXG5cbiAgcyA9IGZOYW1lLnJlcGxhY2UoL18vZyxcIiBcIilcbiAgcyA9IHMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzLnN1YnN0cmluZygxKVxuICByZXR1cm4gc1xuXG5cbnJlbmRlcl9maWVsZCA9IChmTmFtZSxkYXRhKS0+XG4gIHJldHVybiAnJyAgdW5sZXNzIGZWYWx1ZSA9IGRhdGFbZk5hbWVdXG4gIFwiXCJcIlxuICA8ZGl2PlxuICAgICAgPHNwYW4gY2xhc3M9J2YtbmFtJz4je3JlbmRlcl9maWVsZF9uYW1lIGZOYW1lfTwvc3Bhbj5cbiAgICAgIDxzcGFuIGNsYXNzPSdmLXZhbCc+I3tyZW5kZXJfZmllbGRfdmFsdWUoZk5hbWUsZGF0YSl9PC9zcGFuPlxuICA8L2Rpdj5cbiAgXCJcIlwiXG5cblxuXG4gIFxucmVuZGVyX2ZpZWxkcyA9KCBmaWVsZHMsIGRhdGEpIC0+XG4gICggcmVuZGVyX2ZpZWxkKGYsIGRhdGEpIGZvciBmIGluIGZpZWxkcykuam9pbignJylcblxuXG5cblxuICBcbnVuZGVyID0gKHMpIC0+IHMucmVwbGFjZSgvIC9nLCAnXycpXG5cblxucmVuZGVyX3RhYnMgPSAoaW5pdGlhbF9sYXlvdXQsIGRhdGEpIC0+XG4gIGxheW91dCA9IGFkZF9vdGhlcl90YWJfdG9fbGF5b3V0IGluaXRpYWxfbGF5b3V0LCBkYXRhXG4gICNyZW5kZXIgaGVhZGVyXG4gIGggPSAnPGRpdiByb2xlPVwidGFicGFuZWxcIiA+J1xuXG4gICNyZW5kZXIgdGFic1xuICBoICs9Jzx1bCBpZD1cImZpZWxkVGFic1wiIGNsYXNzPVwibmF2IG5hdi10YWJzXCIgcm9sZT1cInRhYmxpc3RcIj4nXG4gIFxuICBmb3IgdGFiLGkgaW4gbGF5b3V0XG4gICAgYWN0aXZlID0gaWYgaT4wIHRoZW4gJycgZWxzZSAnYWN0aXZlJ1xuICAgIGggKz1cIlwiXCJcbiAgICAgIDxsaSByb2xlPVwicHJlc2VudGF0aW9uXCIgY2xhc3M9XCIje2FjdGl2ZX1cIiBvbmNsaWNrPVwicmVtZW1iZXJfdGFiKCcje3VuZGVyKHRhYi5uYW1lKX0nKVwiPlxuICAgICAgICA8YSBocmVmPVwiIyN7dW5kZXIodGFiLm5hbWUpfVwiIGFyaWEtY29udHJvbHM9XCJob21lXCIgcm9sZT1cInRhYlwiIGRhdGEtdG9nZ2xlPVwidGFiXCI+XG4gICAgICAgICN7dGFiLm5hbWV9XG4gICAgICAgIDwvYT5cbiAgICAgIDwvbGk+XG4gICAgXCJcIlwiXG5cbiAgaCArPSAnPC91bD4nXG4gIGggKz0gJzxkaXYgY2xhc3M9XCJ0YWItY29udGVudFwiPidcblxuICAjcmVuZGVyIHRhYnMgY29udGVudFxuICBmb3IgdGFiLGkgaW4gbGF5b3V0XG4gICAgYWN0aXZlID0gaWYgaT4wIHRoZW4gJycgZWxzZSAnYWN0aXZlJ1xuICAgIGggKz1cIlwiXCJcbiAgICA8ZGl2IHJvbGU9XCJ0YWJwYW5lbFwiIGNsYXNzPVwidGFiLXBhbmUgI3thY3RpdmV9XCIgaWQ9XCIje3VuZGVyKHRhYi5uYW1lKX1cIiBzdHlsZT1cInBhZGRpbmctdG9wOiA0MHB4O1wiPlxuICAgICAgICAje3JlbmRlcl9maWVsZHMgdGFiLmZpZWxkcywgZGF0YX1cbiAgICA8L2Rpdj5cbiAgICBcIlwiXCJcbiAgXG4gICNyZW5kZXIgZm9vdGVyXG4gIGggKz0nPC9kaXY+J1xuICBoICs9JzwvZGl2PidcbiAgcmV0dXJuIGhcblxuXG5nZXRfbGF5b3V0X2ZpZWxkcyA9IChsYSkgLT5cbiAgZiA9IHt9XG4gIGZvciB0IGluIGxhXG4gICAgZm9yIGZpZWxkIGluIHQuZmllbGRzXG4gICAgICBmW2ZpZWxkXSA9IDFcbiAgcmV0dXJuIGZcblxuZ2V0X3JlY29yZF9maWVsZHMgPSAocikgLT5cbiAgZiA9IHt9XG4gIGZvciBmaWVsZF9uYW1lIG9mIHJcbiAgICBmW2ZpZWxkX25hbWVdID0gMVxuICByZXR1cm4gZlxuXG5nZXRfdW5tZW50aW9uZWRfZmllbGRzID0gKGxhLCByKSAtPlxuICBsYXlvdXRfZmllbGRzID0gZ2V0X2xheW91dF9maWVsZHMgbGFcbiAgcmVjb3JkX2ZpZWxkcyA9IGdldF9yZWNvcmRfZmllbGRzIHJcbiAgdW5tZW50aW9uZWRfZmllbGRzID0gW11cbiAgXG4gICNmb3IgZiBvZiByZWNvcmRfZmllbGRzXG4gICMgIGlmIG5vdCBsYXlvdXRfZmllbGRzW2ZdXG4gICMgICAgdW5tZW50aW9uZWRfZmllbGRzLnB1c2ggZlxuICBcbiAgdW5tZW50aW9uZWRfZmllbGRzLnB1c2goZikgZm9yIGYgb2YgcmVjb3JkX2ZpZWxkcyB3aGVuIG5vdCBsYXlvdXRfZmllbGRzW2ZdXG5cbiAgcmV0dXJuIHVubWVudGlvbmVkX2ZpZWxkc1xuXG5cbmFkZF9vdGhlcl90YWJfdG9fbGF5b3V0ID0gKGxheW91dD1bXSwgZGF0YSkgLT5cbiAgI2Nsb25lIHRoZSBsYXlvdXRcbiAgbCA9ICQuZXh0ZW5kIHRydWUsIFtdLCBsYXlvdXRcbiAgdCA9XG4gICAgbmFtZTogXCJPdGhlclwiXG4gICAgZmllbGRzOiBnZXRfdW5tZW50aW9uZWRfZmllbGRzIGwsIGRhdGFcblxuICBsLnB1c2ggdFxuICByZXR1cm4gbFxuXG5cblxuXG5jbGFzcyBUZW1wbGF0ZXMyXG5cbiAgQGxpc3QgPSB1bmRlZmluZWRcblxuICBjb25zdHJ1Y3RvcjooKSAtPlxuICAgIEBsaXN0ID0gW11cblxuICBhZGRfdGVtcGxhdGU6IChsYXlvdXRfbmFtZSwgbGF5b3V0X2pzb24pIC0+XG4gICAgQGxpc3QucHVzaFxuICAgICAgbmFtZTpsYXlvdXRfbmFtZVxuICAgICAgcmVuZGVyOihkYXQpIC0+XG4gICAgICAgIHJlbmRlcl90YWJzKGxheW91dF9qc29uLCBkYXQpXG5cblxuICBsb2FkX3RlbXBsYXRlOih0ZW1wbGF0ZV9uYW1lLCB1cmwpIC0+XG4gICAgJC5hamF4XG4gICAgICB1cmw6IHVybFxuICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgY2FjaGU6IHRydWVcbiAgICAgIHN1Y2Nlc3M6ICh0ZW1wbGF0ZV9qc29uKSA9PlxuICAgICAgICBAYWRkX3RlbXBsYXRlKHRlbXBsYXRlX25hbWUsIHRlbXBsYXRlX2pzb24pXG4gICAgICAgIHJldHVyblxuXG5cbiAgZ2V0X25hbWVzOiAtPlxuICAgICh0Lm5hbWUgZm9yIHQgaW4gQGxpc3QpXG5cbiAgZ2V0X2luZGV4X2J5X25hbWU6IChuYW1lKSAtPlxuICAgIGZvciB0LGkgaW4gQGxpc3RcbiAgICAgIGlmIHQubmFtZSBpcyBuYW1lXG4gICAgICAgIHJldHVybiBpXG4gICAgIHJldHVybiAtMVxuXG4gIGdldF9odG1sOiAoaW5kLCBkYXRhKSAtPlxuICAgIGlmIChpbmQgaXMgLTEpIHRoZW4gcmV0dXJuICBcIlwiXG4gICAgXG4gICAgaWYgQGxpc3RbaW5kXVxuICAgICAgcmV0dXJuIEBsaXN0W2luZF0ucmVuZGVyKGRhdGEpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIFwiXCJcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gVGVtcGxhdGVzMlxuIl19
